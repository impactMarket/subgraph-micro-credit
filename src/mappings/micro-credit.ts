import { Address, BigDecimal, store } from '@graphprotocol/graph-ts';
import { Asset, Borrower, Loan, MicroCredit, LoanManager, Repayment } from '../../generated/schema';
import {
    LoanAdded,
    LoanClaimed,
    ManagerAdded,
    UserAddressChanged,
    RepaymentAdded
} from '../../generated/MicroCredit/MicroCredit';

const cUSD = '0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1';

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
    const loan = new Loan(event.params.loanId.toString());

    loan.userAddress = event.params.userAddress;
    loan.amount = normalize(event.params.amount.toString());
    // TODO: readd when new contract is deployed
    // loan.period = event.params.period.toI32();
    loan.dailyInterest = normalize(event.params.dailyInterest.toString());

    loan.save();
}

export function handleLoanClaimed(event: LoanClaimed): void {
    // load loan
    const loan = Loan.load(event.params.loanId.toString())!;
    let borrower = Borrower.load(loan.userAddress.toHexString());

    if (!borrower) {
        // create borrower entity
        borrower = new Borrower(loan.userAddress.toHexString());

        borrower.loans = new Array<string>();
    }

    // load or create new global micro credit entity
    let microCredit = MicroCredit.load('0');

    if (!microCredit) {
        microCredit = new MicroCredit('0');
        microCredit.borrowers = 0;
        microCredit.repayments = 0;
    }

    // update global micro credit entity data
    const assetBorrowedId = `borrowed-${cUSD}-0`;
    const assetDebtId = `debt-${cUSD}-0`;
    const assetLiquidityId = `liquidity-${cUSD}-0`;

    microCredit.borrowed = updateAsset(assetBorrowedId, cUSD, loan.amount, microCredit.borrowed, false);
    microCredit.debt = updateAsset(assetDebtId, cUSD, loan.amount, microCredit.debt, false);
    microCredit.liquidity = updateAsset(assetLiquidityId, cUSD, loan.amount, microCredit.liquidity, true);
    microCredit.borrowers += 1;

    // update borrower entity data
    const borrowerLoans = borrower.loans;

    borrowerLoans.push(event.params.loanId.toString());
    borrower.loans = borrowerLoans;

    microCredit.save();
    borrower.save();

    // TBA: update borrower entity
}

// update Borrower entity id
export function handleUserAddressChanged(event: UserAddressChanged): void {
    const borrowerOldAccount = Borrower.load(event.params.oldWalletAddress.toHex())!;
    const borrowerNewAccount = new Borrower(event.params.newWalletAddress.toHex());

    borrowerNewAccount.merge([borrowerOldAccount]);

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

    loanManagerAccount.save();
}

export function handleManagerRemoved(event: ManagerAdded): void {
    let loanManagerAccount = LoanManager.load(event.params.managerAddress.toHex());

    if (!loanManagerAccount) {
        loanManagerAccount = new LoanManager(event.params.managerAddress.toHex());
    }

    loanManagerAccount.id = '';

    loanManagerAccount.save();
}

export function handleRepaymentAdded(event: RepaymentAdded): void {
    let repayment = Repayment.load(event.params.userAddress.toHex());

    if (!repayment) {
        repayment = new Repayment(event.params.userAddress.toHex());
    }

    repayment.repaymentAmount = normalize(event.params.repaymentAmount.toString());
    repayment.userAddress = event.params.userAddress;
    repayment.loanId = event.params.loanId.toHex();
    repayment.timestamp = event.block.timestamp.toI32();

    repayment.save();
}
