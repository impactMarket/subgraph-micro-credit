import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { Asset, MicroCredit } from '../../generated/schema';
import {
    LoanAdded
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
function updateAsset(assetId: string, asset: string, amount: BigInt, array: Array<string> | null, isMinus: boolean): Array<string> {
    let assetUpdated = Asset.load(assetId);

    // create asset entity if it doesn't exist
    if (!assetUpdated) {
        assetUpdated = new Asset(assetId);
        assetUpdated.amount = BigDecimal.zero();
    }

    // update new asset entity data
    assetUpdated.asset = Address.fromString(asset);
    if (isMinus) {
        assetUpdated.amount = assetUpdated.amount.minus(normalize(amount.toString()));
    } else {
        assetUpdated.amount = assetUpdated.amount.plus(normalize(amount.toString()));
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

    microCredit.borrowed = updateAsset(assetBorrowedId, cUSD, event.params.amount, microCredit.borrowed, false);
    microCredit.debt = updateAsset(assetDebtId, cUSD, event.params.amount, microCredit.debt, false);
    microCredit.liquidity = updateAsset(assetLiquidityId, cUSD, event.params.amount, microCredit.liquidity, true);
    microCredit.borrowers += 1;

    microCredit.save();

    // TBA: update borrower entity
}
