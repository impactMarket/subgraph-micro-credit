import { Address, BigDecimal, store } from '@graphprotocol/graph-ts';
import { Asset, Borrower, Loan, LoanManager, MicroCredit } from '../../generated/schema';
import {
    LoanAdded,
    LoanClaimed,
    ManagerAdded,
    RepaymentAdded,
    UserAddressChanged
} from '../../generated/MicroCredit/MicroCredit';
import { cUSDAddress } from '../addresses';

export const normalize = (amount: string): BigDecimal =>
    BigDecimal.fromString(amount).div(BigDecimal.fromString('1000000000000000000'));

/**
 * Generic asset entity update. It updates de array linked to the main entity and saves it.
 * @param {string} assetId Asset id
 * @param {string} asset Asset address
 * @param {BigInt} amount Amount to be added or subtracted
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

    newArray.push(assetId);

    // save newly created asset entity
    assetUpdated.save();

    return newArray;
}

export function handleLoanAdded(event: LoanAdded): void {
    // register loan to LoanAdded entity
    const borrowerLoanId = `${event.params.userAddress.toHex()}-${event.params.loanId.toString()}`;
    const loan = new Loan(borrowerLoanId);


    let borrower = Borrower.load(event.params.userAddress.toHex());

    if (!borrower) {
        // create borrower entity
        borrower = new Borrower(event.params.userAddress.toHex());
    }

    loan.borrower = event.params.userAddress.toHex();
    loan.amount = normalize(event.params.amount.toString());
    loan.period = event.params.period.toI32();
    loan.dailyInterest = normalize(event.params.dailyInterest.toString());
    loan.repayed = BigDecimal.zero();
    loan.addedBy = event.transaction.from.toHex();

    loan.save();
    borrower.save();
}

export function handleLoanClaimed(event: LoanClaimed): void {
    // load loan
    const borrowerLoanId = `${event.params.userAddress.toHex()}-${event.params.loanId.toString()}`;
    const loan = Loan.load(borrowerLoanId)!;

    // load or create new global micro credit entity
    let microCredit = MicroCredit.load('0');

    if (!microCredit) {
        microCredit = new MicroCredit('0');
        microCredit.borrowers = 0;
        microCredit.repayments = 0;
    }

    // update global micro credit entity data
    const assetBorrowedId = `borrowed-${cUSDAddress}-0`;
    const assetDebtId = `debt-${cUSDAddress}-0`;
    const assetLiquidityId = `liquidity-${cUSDAddress}-0`;

    microCredit.borrowed = updateAsset(assetBorrowedId, cUSDAddress, loan.amount, microCredit.borrowed, false);
    microCredit.debt = updateAsset(assetDebtId, cUSDAddress, loan.amount, microCredit.debt, false);
    microCredit.liquidity = updateAsset(assetLiquidityId, cUSDAddress, loan.amount, microCredit.liquidity, true);
    microCredit.borrowers += 1;

    // update loan entity data
    loan.claimed = event.block.timestamp.toI32();

    // save entities
    loan.save();
    microCredit.save();
}

// update Borrower entity id
export function handleUserAddressChanged(event: UserAddressChanged): void {
    const borrowerOldAccount = Borrower.load(event.params.oldWalletAddress.toHex())!;
    const borrowerNewAccount = new Borrower(event.params.newWalletAddress.toHex());

    borrowerNewAccount.merge([borrowerOldAccount]);

    for (let i = 0; i < borrowerOldAccount.loans.length; ++i) {
        const oldLoan = Loan.load(borrowerOldAccount.loans[i])!;
        const borrowerLoanId = `${event.params.newWalletAddress.toHex()}-${(i + 1).toString()}`;
        const newLoan = new Loan(borrowerLoanId);

        newLoan.merge([oldLoan]);

        newLoan.id = borrowerLoanId;
        newLoan.borrower = event.params.newWalletAddress.toHex();

        newLoan.save();
        store.remove('Loan', oldLoan.id);
    }

    borrowerNewAccount.id = event.params.newWalletAddress.toHex();

    borrowerNewAccount.save();
    store.remove('Borrower', event.params.oldWalletAddress.toHex());
}

// update LoanManager entity id
export function handleManagerAdded(event: ManagerAdded): void {
    let loanManagerAccount = LoanManager.load(event.params.managerAddress.toHex());

    if (!loanManagerAccount) {
        loanManagerAccount = new LoanManager(event.params.managerAddress.toHex());
    }

    loanManagerAccount.state = 0;

    loanManagerAccount.save();
}

export function handleManagerRemoved(event: ManagerAdded): void {
    let loanManagerAccount = LoanManager.load(event.params.managerAddress.toHex());

    if (!loanManagerAccount) {
        loanManagerAccount = new LoanManager(event.params.managerAddress.toHex());
    }

    loanManagerAccount.state = 1;

    loanManagerAccount.save();
}

export function handleRepaymentAdded(event: RepaymentAdded): void {
    const borrowerLoanId = `${event.params.userAddress.toHex()}-${event.params.loanId.toString()}`;
    const loan = Loan.load(borrowerLoanId)!;

    // update loan entity data
    loan.repayed = loan.repayed.plus(normalize(event.params.repaymentAmount.toString()));
    loan.lastRepayment = event.block.timestamp.toI32();

    // load or create new global micro credit entity
    let microCredit = MicroCredit.load('0');

    if (!microCredit) {
        microCredit = new MicroCredit('0');
        microCredit.borrowers = 0;
        microCredit.repayments = 0;
    }

    // update global micro credit entity data
    const assetRepaidId = `repaid-${cUSDAddress}-0`;

    microCredit.repaid = updateAsset(
        assetRepaidId,
        cUSDAddress,
        normalize(event.params.repaymentAmount.toString()),
        microCredit.repaid,
        false
    );

    loan.save();
    microCredit.save();
}
