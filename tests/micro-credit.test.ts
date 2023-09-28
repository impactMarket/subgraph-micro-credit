import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';
import { cUSDAddress, toToken, userAddress } from './utils/contants';
import {
    createLoanAddedEvent,
    createLoanClaimedEvent,
    createManagerAddedEvent,
    createManagerRemovedEvent,
    createRepaymentAddedEvent,
    createUserAddressChangedEvent
} from './utils/micro-credit';
import {
    handleLoanAdded,
    handleLoanClaimed,
    handleManagerAdded,
    handleManagerRemoved,
    handleRepaymentAdded,
    handleUserAddressChanged
} from '../src/mappings/micro-credit';

export { handleLoanAdded, handleLoanClaimed, handleUserAddressChanged };

test('[handleLoanClaimed] register and claim', () => {
    clearStore();

    // register two loans, so we can also test the averages

    const managerAddedEvent = createManagerAddedEvent(userAddress[2]);

    handleManagerAdded(managerAddedEvent);

    const loanAddedEvent1 = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(0),
        toToken('10'),
        BigInt.fromI32(3600 * 24 * 30 * 6),
        BigInt.fromString(BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000')).toString()),
        BigInt.fromI32(1680267154),
        userAddress[2]
    );
    const loanAddedEvent2 = createLoanAddedEvent(
        userAddress[1],
        BigInt.fromI32(1),
        toToken('20'),
        BigInt.fromI32(3600 * 24 * 30 * 8),
        BigInt.fromString(BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000')).toString()),
        BigInt.fromI32(1680267154),
        userAddress[2]
    );

    handleLoanAdded(loanAddedEvent1);
    handleLoanAdded(loanAddedEvent2);

    const loanClaimed1 = createLoanClaimedEvent(userAddress[0], BigInt.fromI32(0));
    const loanClaimed2 = createLoanClaimedEvent(userAddress[1], BigInt.fromI32(1));

    handleLoanClaimed(loanClaimed1);
    handleLoanClaimed(loanClaimed2);

    assert.fieldEquals('MicroCredit', '0', 'loans', '2');
    assert.fieldEquals('MicroCredit', '0', 'borrowed', `[1-borrowed-${cUSDAddress}-0]`);
    assert.fieldEquals('Asset', `1-borrowed-${cUSDAddress}-0`, 'amount', '30');
    assert.fieldEquals('Loan', `${userAddress[0]}-0`, 'claimed', loanClaimed1.block.timestamp.toString());
    assert.fieldEquals('AverageValue', `1-avgLoanAmount-${cUSDAddress}-0`, 'value', '15');
    assert.fieldEquals('AverageValue', `1-avgLoanPeriod-${cUSDAddress}-0`, 'value', (3600 * 24 * 30 * 7).toString());
});

test('[handleLoanAdded] register', () => {
    clearStore();

    const managerAddedEvent = createManagerAddedEvent(userAddress[1]);

    handleManagerAdded(managerAddedEvent);

    const loanAddedEvent = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(0),
        toToken('10'),
        BigInt.fromI32(3600 * 24 * 30 * 6),
        BigInt.fromString(BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000')).toString()),
        BigInt.fromI32(1680267154),
        userAddress[1]
    );

    handleLoanAdded(loanAddedEvent);

    // assert Loan entity
    assert.fieldEquals('Loan', `${userAddress[0]}-0`, 'borrower', userAddress[0]);
    assert.fieldEquals('Loan', `${userAddress[0]}-0`, 'amount', '10');
    assert.fieldEquals('Loan', `${userAddress[0]}-0`, 'period', BigInt.fromI32(3600 * 24 * 30 * 6).toString());
    assert.fieldEquals('Loan', `${userAddress[0]}-0`, 'repaid', '0');

    assert.entityCount('MicroCredit', 0);
});

test('[handleUserAddressChanged] change address', () => {
    clearStore();

    const managerAddedEvent = createManagerAddedEvent(userAddress[1]);

    handleManagerAdded(managerAddedEvent);

    const loanAddedEvent = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(0),
        toToken('10'),
        BigInt.fromI32(3600 * 24 * 30 * 6),
        BigInt.fromString(BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000')).toString()),
        BigInt.fromI32(1680267154),
        userAddress[1]
    );

    handleLoanAdded(loanAddedEvent);

    const loanClaimed = createLoanClaimedEvent(userAddress[0], BigInt.fromI32(1));

    handleLoanClaimed(loanClaimed);

    const userAddressChangedEvent = createUserAddressChangedEvent(userAddress[0], userAddress[1]);

    handleUserAddressChanged(userAddressChangedEvent);

    // assert Borrower entity id change
    assert.entityCount('Borrower', 1);
    assert.notInStore('Borrower', userAddress[0]);
    assert.fieldEquals('Borrower', userAddress[1], 'loans', `[${userAddress[1]}-0]`);
    assert.fieldEquals('Loan', `${userAddress[1]}-0`, 'borrower', userAddress[1]);
});

test('[handleManagerAdded] register', () => {
    clearStore();

    const ManagerAddedEvent = createManagerAddedEvent(userAddress[0]);

    handleManagerAdded(ManagerAddedEvent);

    assert.entityCount('LoanManager', 1);
    assert.fieldEquals('LoanManager', userAddress[0], 'id', userAddress[0]);
});

test('[handleManagerRemoved]', () => {
    clearStore();

    const managerAddedEvent = createManagerAddedEvent(userAddress[0]);

    handleManagerAdded(managerAddedEvent);

    const managerRemovedEvent = createManagerRemovedEvent(userAddress[0]);

    handleManagerRemoved(managerRemovedEvent);

    assert.entityCount('LoanManager', 1);
    assert.fieldEquals('LoanManager', userAddress[0], 'state', '1');
});

test('[handleRepaymentAdded]', () => {
    clearStore();

    const managerAddedEvent = createManagerAddedEvent(userAddress[1]);

    handleManagerAdded(managerAddedEvent);

    const loanAddedEvent = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(0),
        toToken('10'),
        BigInt.fromI32(3600 * 24 * 30 * 6),
        BigInt.fromString(BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000')).toString()),
        BigInt.fromI32(1680267154),
        userAddress[1]
    );

    handleLoanAdded(loanAddedEvent);

    const loanClaimed = createLoanClaimedEvent(userAddress[0], BigInt.fromI32(0));

    handleLoanClaimed(loanClaimed);

    assert.fieldEquals('MicroCredit', '0', 'debt', `[1-debt-${cUSDAddress}-0]`);
    assert.fieldEquals('Asset', `1-debt-${cUSDAddress}-0`, 'amount', '10');

    const RepaymentAddedEvent1 = createRepaymentAddedEvent(
        userAddress[0],
        BigInt.fromI32(0),
        toToken('5'),
        toToken('6')
    );

    handleRepaymentAdded(RepaymentAddedEvent1);

    assert.fieldEquals('MicroCredit', '0', 'debt', `[1-debt-${cUSDAddress}-0]`);
    assert.fieldEquals('Asset', `1-debt-${cUSDAddress}-0`, 'amount', '6');

    const RepaymentAddedEvent2 = createRepaymentAddedEvent(
        userAddress[0],
        BigInt.fromI32(0),
        toToken('6'),
        toToken('0')
    );

    handleRepaymentAdded(RepaymentAddedEvent2);

    assert.entityCount('Loan', 1);
    assert.fieldEquals('Loan', `${userAddress[0]}-0`, 'repaid', '11');
    assert.fieldEquals('MicroCredit', '0', 'interest', `[1-interest-${cUSDAddress}-0]`);
    assert.fieldEquals('Asset', `1-interest-${cUSDAddress}-0`, 'amount', '1');
});

// TODO: add loan, change loan manager and remove first manager
