import { Address, BigDecimal, BigInt, store } from '@graphprotocol/graph-ts';
import { Asset, AverageValue, Borrower, Loan, LoanManager, MicroCredit, Repayment } from '../../generated/schema';
import {
    LoanAdded,
    LoanClaimed,
    ManagerAdded,
    ManagerAdded1,
    ManagerChanged,
    ManagerRemoved,
    RepaymentAdded,
    UserAddressChanged
} from '../../generated/MicroCredit/MicroCredit';
import { cUSDAddress, clientAddresses } from '../addresses';

export const normalize = (amount: string): BigDecimal =>
    BigDecimal.fromString(amount).div(BigDecimal.fromString('1000000000000000000'));

/**
 * Generic asset entity update. It updates de array linked to the main entity and saves it.
 * @param {string} assetId Asset id
 * @param {string} asset Asset address
 * @param {BigDecimal} amount Amount to be added or subtracted
 * @param {Array<string> | null} array Array to be updated
 * @param {boolean} isMinus Boolean to indicate if the amount should be subtracted or added
 * @returns {Array<string>} Returns updated array
 */
function updateAsset(
    assetId: string,
    asset: string,
    amount: BigDecimal,
    array: Array<string> | null,
    isMinus: boolean
): Array<string> {
    let assetUpdated = Asset.load(assetId);

    // create asset entity if it doesn't exist
    if (!assetUpdated) {
        assetUpdated = new Asset(assetId);
        assetUpdated.amount = BigDecimal.zero();
    }

    // update new asset entity data
    assetUpdated.asset = Address.fromString(asset);
    if (isMinus) {
        assetUpdated.amount = assetUpdated.amount.minus(amount);
    } else {
        assetUpdated.amount = assetUpdated.amount.plus(amount);
    }

    let newArray = array;

    // create array if it doesn't exist
    if (!newArray) {
        newArray = new Array<string>();
    }

    if (!newArray.includes(assetId)) {
        newArray.push(assetId);
    }

    // save newly created asset entity
    assetUpdated.save();

    return newArray;
}

/**
 * Generic average entity update. It updates de array linked to the main entity and saves it.
 * @param {string} averageId Average id
 * @param {BigDecimal} amount Amount to be averaged
 * @param {Array<string> | null} array Array to be updated
 * @returns {Array<string>} Returns updated array
 */
function updateAverage(averageId: string, amount: BigDecimal, array: Array<string> | null): Array<string> {
    let averageUpdated = AverageValue.load(averageId);

    // create average entity if it doesn't exist
    if (!averageUpdated) {
        averageUpdated = new AverageValue(averageId);
        averageUpdated.value = BigDecimal.zero();
        averageUpdated.count = 0;
    }

    let newArray = array;

    // create array if it doesn't exist
    if (!newArray) {
        newArray = new Array<string>();
    }

    if (!newArray.includes(averageId)) {
        newArray.push(averageId);
    }

    // update new average entity data
    // update the "value" with the following formula "value += (amount - value) / (count + 1)"
    averageUpdated.value = averageUpdated.value.plus(
        amount.minus(averageUpdated.value).div(BigDecimal.fromString((averageUpdated.count + 1).toString()))
    );
    averageUpdated.count += 1;

    // save newly created average entity
    averageUpdated.save();

    return newArray;
}

export function handleLoanAdded(event: LoanAdded): void {
    // avoid initial testnet loans causing wrong values
    if (
        (cUSDAddress === '0x874069fa1eb16d44d622f2e0ca25eea172369bc1' && event.block.number.toI32() < 17089331) ||
        event.params.userAddress.equals(Address.fromString('0x53927a9a4908521c637c8b0e68ade32ccfe469cb')) ||
        event.params.userAddress.equals(Address.fromString('0xa41261d4ad48104aa9c3f81c2e3e4d7fd0a6f160'))
    ) {
        return;
    }
    // register loan to LoanAdded entity
    const borrowerLoanId = `${event.params.userAddress.toHex()}-${event.params.loanId.toString()}`;
    const loan = new Loan(borrowerLoanId);

    let borrower = Borrower.load(event.params.userAddress.toHex());

    if (!borrower) {
        // create borrower entity
        borrower = new Borrower(event.params.userAddress.toHex());
        borrower.loansCount = 0;
        borrower.repaymentsCount = 0;
        borrower.clientId = clientAddresses.indexOf(event.address.toHex());
    }
    
    borrower.loansCount += 1;
    borrower.lastLoanStatus = 0;
    loan.borrower = event.params.userAddress.toHex();
    loan.amount = normalize(event.params.amount.toString());
    loan.lastDebt = normalize(event.params.amount.toString());
    loan.period = event.params.period.toI32();
    loan.dailyInterest = normalize(event.params.dailyInterest.toString());
    loan.repaid = BigDecimal.zero();
    loan.added = event.block.timestamp.toI32();
    loan.addedBy = event.transaction.from.toHex();
    loan.repaymentsCount = 0;
    loan.index = event.params.loanId.toI32();
    //
    borrower.lastLoanAmount = normalize(event.params.amount.toString());
    borrower.lastLoanLastDebt = normalize(event.params.amount.toString());
    borrower.lastLoanPeriod = event.params.period.toI32();
    borrower.lastLoanDailyInterest = normalize(event.params.dailyInterest.toString());
    borrower.lastLoanRepaid = BigDecimal.zero();
    borrower.lastLoanAdded = event.block.timestamp.toI32();
    borrower.lastLoanAddedBy = event.transaction.from.toHex();
    borrower.lastLoanRepayments = 0;
    // @ts-ignore need to nullify these values
    borrower.lastLoanLastRepayment = null;
    borrower.lastLoanLastRepaymentAmount = null;
    borrower.entityLastUpdated = event.block.timestamp.toI32();

    loan.save();
    borrower.save();
}

export function handleLoanClaimed(event: LoanClaimed): void {
    // load loan
    const borrowerLoanId = `${event.params.userAddress.toHex()}-${event.params.loanId.toString()}`;
    const loan = Loan.load(borrowerLoanId);

    if (!loan) {
        return;
    }
    const clientId = clientAddresses.indexOf(event.address.toHex());
    const borrower = Borrower.load(event.params.userAddress.toHex())!;
    const loanManagerId = loan.addedBy;
    let loanManager = LoanManager.load(loanManagerId);

    if (!loanManager) {
        loanManager = new LoanManager(loanManagerId);
        loanManager.state = 0;
        loanManager.borrowers = 0;
        loanManager.loans = 0;
        loanManager.loanLimitAmount = BigDecimal.zero();
        loanManager.currentlyLentAmount = BigDecimal.zero();
        loanManager.clientId = clientId;
    }

    // update daily stats
    const dayId = (event.block.timestamp.toI32() / 86400).toString();
    let microCreditDaily = MicroCredit.load(dayId);

    if (!microCreditDaily) {
        microCreditDaily = new MicroCredit(dayId);
        microCreditDaily.loans = 0;
        microCreditDaily.repaidLoans = 0;
        microCreditDaily.clientId = clientId;
    }

    // load or create new global micro credit entity
    let microCredit = MicroCredit.load('0');

    if (!microCredit) {
        microCredit = new MicroCredit('0');
        microCredit.loans = 0;
        microCredit.repaidLoans = 0;
        microCredit.clientId = clientId;
    }

    // update global micro credit entity data
    const assetBorrowedId = `${clientId}-borrowed-${cUSDAddress}-0`;
    const assetDebtId = `${clientId}-debt-${cUSDAddress}-0`;
    // const assetLiquidityId = `liquidity-${cUSDAddress}-0`;
    const avgLoanAmountId = `${clientId}-avgLoanAmount-${cUSDAddress}-0`;
    const avgLoanPeriodId = `${clientId}-avgLoanPeriod-${cUSDAddress}-0`;
    // daily
    const assetBorrowedDailyId = `${clientId}-borrowed-${cUSDAddress}-${dayId}`;
    const assetDebtDailyId = `${clientId}-debt-${cUSDAddress}-${dayId}`;
    const avgLoanAmountDailyId = `${clientId}-avgLoanAmount-${cUSDAddress}-${dayId}`;
    const avgLoanPeriodDailyId = `${clientId}-avgLoanPeriod-${cUSDAddress}-${dayId}`;

    microCredit.borrowed = updateAsset(assetBorrowedId, cUSDAddress, loan.amount, microCredit.borrowed, false);
    microCredit.debt = updateAsset(assetDebtId, cUSDAddress, loan.amount, microCredit.debt, false);
    // microCredit.liquidity = updateAsset(assetLiquidityId, cUSDAddress, loan.amount, microCredit.liquidity, true);
    microCredit.loans += 1;
    microCredit.avgLoanAmount = updateAverage(avgLoanAmountId, loan.amount, microCredit.avgLoanAmount);
    microCredit.avgLoanPeriod = updateAverage(
        avgLoanPeriodId,
        BigDecimal.fromString(loan.period.toString()),
        microCredit.avgLoanPeriod
    );

    microCreditDaily.borrowed = updateAsset(
        assetBorrowedDailyId,
        cUSDAddress,
        loan.amount,
        microCreditDaily.borrowed,
        false
    );
    microCreditDaily.debt = updateAsset(assetDebtDailyId, cUSDAddress, loan.amount, microCreditDaily.debt, false);
    microCreditDaily.loans += 1;
    microCreditDaily.avgLoanAmount = updateAverage(avgLoanAmountDailyId, loan.amount, microCreditDaily.avgLoanAmount);
    microCreditDaily.avgLoanPeriod = updateAverage(
        avgLoanPeriodDailyId,
        BigDecimal.fromString(loan.period.toString()),
        microCreditDaily.avgLoanPeriod
    );

    // update loan entity data
    loan.claimed = event.block.timestamp.toI32();
    borrower.lastLoanClaimed = event.block.timestamp.toI32();

    borrower.lastLoanStatus = 1;
    borrower.entityLastUpdated = event.block.timestamp.toI32();
    if (borrower.loansCount === 1) {
        loanManager.borrowers += 1;
    }
    loanManager.loans += 1;
    loanManager.currentlyLentAmount = loanManager.currentlyLentAmount.plus(loan.amount);

    // save entities
    loan.save();
    borrower.save();
    microCredit.save();
    microCreditDaily.save();
    loanManager.save();
}

// update Borrower entity id
export function handleUserAddressChanged(event: UserAddressChanged): void {
    const borrowerOldAccount = Borrower.load(event.params.oldWalletAddress.toHex());
    const borrowerNewAccount = new Borrower(event.params.newWalletAddress.toHex());

    if (borrowerOldAccount) {
        for (let l = 0; l < borrowerOldAccount.loansCount; l++) {
            const borrowerOldLoanId = `${event.params.oldWalletAddress.toHex()}-${l.toString()}`;
            const oldLoan = Loan.load(borrowerOldLoanId);

            if (!oldLoan) {
                continue;
            }
            const borrowerLoanId = `${event.params.newWalletAddress.toHex()}-${l.toString()}`;
            const newLoan = new Loan(borrowerLoanId);

            newLoan.merge([oldLoan]);

            newLoan.id = borrowerLoanId;
            newLoan.borrower = borrowerNewAccount.id;

            newLoan.save();

            // update repayments to each loan
            for (let r = 0; r < oldLoan.repaymentsCount; r++) {
                const repaymentId = `${event.params.oldWalletAddress.toHex()}-${oldLoan.index.toString()}-${r.toString()}`;
                const oldRepayment = Repayment.load(repaymentId);

                if (!oldRepayment) {
                    continue;
                }
                const borrowerRepaymentId = `${event.params.newWalletAddress.toHex()}-${oldLoan.index.toString()}-${r.toString()}`;
                const newRepayment = new Repayment(borrowerRepaymentId);

                newRepayment.merge([oldRepayment]);

                newRepayment.id = borrowerRepaymentId;
                newRepayment.borrower = borrowerNewAccount.id;

                newRepayment.save();
                store.remove('Repayment', oldRepayment.id);
            }
            store.remove('Loan', oldLoan.id);
        }

        borrowerNewAccount.merge([borrowerOldAccount]);
        borrowerNewAccount.id = event.params.newWalletAddress.toHex();

        borrowerNewAccount.save();
        store.remove('Borrower', event.params.oldWalletAddress.toHex());
    }
}

// update LoanManager entity id
export function handleManagerAdded(event: ManagerAdded): void {
    let loanManager = LoanManager.load(event.params.managerAddress.toHex());

    if (!loanManager) {
        loanManager = new LoanManager(event.params.managerAddress.toHex());
        loanManager.borrowers = 0;
        loanManager.loans = 0;
        loanManager.loanLimitAmount = BigDecimal.zero();
        loanManager.currentlyLentAmount = BigDecimal.zero();
        loanManager.clientId = clientAddresses.indexOf(event.address.toHex());
    }

    loanManager.state = 0;
    loanManager.save();
}

// update LoanManager entity id
export function handleManagerAdded1(event: ManagerAdded1): void {
    let loanManager = LoanManager.load(event.params.managerAddress.toHex());

    if (!loanManager) {
        loanManager = new LoanManager(event.params.managerAddress.toHex());
        loanManager.borrowers = 0;
        loanManager.loans = 0;
        loanManager.currentlyLentAmount = BigDecimal.zero();
        loanManager.clientId = clientAddresses.indexOf(event.address.toHex());
    }
    loanManager.loanLimitAmount = normalize(event.params.currentLentAmountLimit.toString());

    loanManager.state = 0;
    loanManager.save();
}

export function handleManagerRemoved(event: ManagerRemoved): void {
    const loanManager = LoanManager.load(event.params.managerAddress.toHex());

    if (loanManager) {
        loanManager.state = 1;
        loanManager.save();
    }
}

export function handleRepaymentAdded(event: RepaymentAdded): void {
    const borrowerLoanId = `${event.params.userAddress.toHex()}-${event.params.loanId.toString()}`;
    const loan = Loan.load(borrowerLoanId);

    if (!loan) {
        return;
    }

    const clientId = clientAddresses.indexOf(event.address.toHex());
    const loanManager = LoanManager.load(loan.addedBy)!;
    const borrower = Borrower.load(event.params.userAddress.toHex())!;
    const repaymentId = `${event.params.userAddress.toHex()}-${event.params.loanId.toString()}-${borrower.repaymentsCount.toString()}`;
    const repayment = new Repayment(repaymentId);

    repayment.borrower = borrower.id;
    repayment.loan = loan.id;
    repayment.amount = normalize(event.params.repaymentAmount.toString());
    repayment.timestamp = event.block.timestamp.toI32();
    repayment.debt = normalize(event.params.currentDebt.toString());

    // update daily stats
    const dayId = (event.block.timestamp.toI32() / 86400).toString();
    let microCreditDaily = MicroCredit.load(dayId);

    if (!microCreditDaily) {
        microCreditDaily = new MicroCredit(dayId);
        microCreditDaily.loans = 0;
        microCreditDaily.repaidLoans = 0;
        microCreditDaily.clientId = clientId;
    }

    // load or create new global micro credit entity
    let microCredit = MicroCredit.load('0');

    if (!microCredit) {
        microCredit = new MicroCredit('0');
        microCredit.loans = 0;
        microCredit.repaidLoans = 0;
        microCredit.clientId = clientId;
    }

    const assetDebtdId = `${clientId}-debt-${cUSDAddress}-0`;

    // NOTE: on daily states, debt is the debt accrued. Repaid is separated.
    // On global state, debt is the total debt
    // so we don't calculate debt here

    // a litle trcik to keep the current debt always updated
    // first we subtract the last added debt, and then we add the current debt
    if (loan.lastDebt !== null) {
        microCredit.debt = updateAsset(assetDebtdId, cUSDAddress, loan.lastDebt!, microCredit.debt, true);
    }

    microCredit.debt = updateAsset(
        assetDebtdId,
        cUSDAddress,
        normalize(event.params.currentDebt.toString()),
        microCredit.debt,
        false
    );

    // update loan entity data
    loan.repaid = loan.repaid.plus(normalize(event.params.repaymentAmount.toString()));
    loan.lastRepayment = event.block.timestamp.toI32();
    loan.lastRepaymentAmount = normalize(event.params.repaymentAmount.toString());
    loan.lastDebt = normalize(event.params.currentDebt.toString());
    loan.repaymentsCount += 1;
    // update borrower last loan entity data
    borrower.lastLoanRepaid = borrower.lastLoanRepaid.plus(normalize(event.params.repaymentAmount.toString()));
    borrower.lastLoanLastRepayment = event.block.timestamp.toI32();
    borrower.lastLoanLastRepaymentAmount = normalize(event.params.repaymentAmount.toString());
    borrower.lastLoanLastDebt = normalize(event.params.currentDebt.toString());
    borrower.lastLoanRepayments += 1;
    borrower.repaymentsCount += 1;
    borrower.entityLastUpdated = event.block.timestamp.toI32();

    // update full repaid loans and interest
    if (event.params.currentDebt.equals(BigInt.fromI32(0))) {
        microCredit.repaidLoans += 1;
        microCreditDaily.repaidLoans += 1;
        borrower.lastLoanStatus = 2;

        const assetInterestdId = `${clientId}-interest-${cUSDAddress}-0`;
        const assetInterestdDailyId = `${clientId}-interest-${cUSDAddress}-${dayId}`;

        microCredit.interest = updateAsset(
            assetInterestdId,
            cUSDAddress,
            loan.repaid.minus(loan.amount),
            microCredit.interest,
            false
        );
        microCreditDaily.interest = updateAsset(
            assetInterestdDailyId,
            cUSDAddress,
            loan.repaid.minus(loan.amount),
            microCreditDaily.interest,
            false
        );
    }
    // update global micro credit entity data
    const assetRepaidId = `${clientId}-repaid-${cUSDAddress}-0`;
    const assetRepaidDailyId = `${clientId}-repaid-${cUSDAddress}-${dayId}`;

    microCredit.repaid = updateAsset(
        assetRepaidId,
        cUSDAddress,
        normalize(event.params.repaymentAmount.toString()),
        microCredit.repaid,
        false
    );
    microCreditDaily.repaid = updateAsset(
        assetRepaidDailyId,
        cUSDAddress,
        normalize(event.params.repaymentAmount.toString()),
        microCreditDaily.repaid,
        false
    );

    loanManager.currentlyLentAmount = loanManager.currentlyLentAmount.minus(loan.amount);

    loan.save();
    borrower.save();
    repayment.save();
    microCredit.save();
    microCreditDaily.save();
}

export function handleManagerChanged(event: ManagerChanged): void {
    const loanManager = LoanManager.load(event.params.managerAddress.toHex());
    const borrower = Borrower.load(event.params.borrowerAddress.toHex());

    if (loanManager && borrower) {
        const loan = Loan.load(`${event.params.borrowerAddress.toHex()}-${(borrower.loansCount - 1).toString()}`);

        if (loan && Address.fromString(loan.addedBy).notEqual(Address.fromString(event.params.managerAddress.toHex()))) {
            const previousLoanManager = LoanManager.load(loan.addedBy)!;

            loanManager.borrowers += 1;
            loanManager.loans += 1;
            loanManager.currentlyLentAmount = loanManager.currentlyLentAmount.plus(loan.amount);
            loan.addedBy = event.params.managerAddress.toHex();
            borrower.lastLoanAddedBy = event.params.managerAddress.toHex();
            borrower.entityLastUpdated = event.block.timestamp.toI32();

            previousLoanManager.borrowers -= 1;
            previousLoanManager.loans -= 1;
            previousLoanManager.currentlyLentAmount = previousLoanManager.currentlyLentAmount.minus(loan.amount);

            loanManager.save();
            loan.save();
            borrower.save();
            previousLoanManager.save();
        }
    }
}
