import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import { Asset, Loan, MicroCredit } from '../../generated/schema';
import { LoanAdded, LoanClaimed } from '../../generated/MicroCredit/MicroCredit';

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
    loan.period = event.params.period.toI32();
    loan.dailyInterest = normalize(event.params.dailyInterest.toString());

    loan.save();
}

export function handleLoanClaimed(event: LoanClaimed): void {
    // load loan
    const loan = Loan.load(event.params.loanId.toString())!;

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

    microCredit.save();

    // TBA: update borrower entity
}
