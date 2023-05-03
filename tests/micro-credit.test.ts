import { BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { assert, clearStore, test } from 'matchstick-as/assembly/index';
import {
    createLoanAddedEvent,
    createLoanClaimedEvent,
    createManagerAddedEvent,
    createRepaidEvent,
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
import { toToken, userAddress } from './utils/contants';

export { handleLoanAdded, handleLoanClaimed, handleUserAddressChanged };

test('[handleLoanClaimed] register and claim', () => {
    clearStore();

    const loanAddedEvent = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(1),
        toToken('10'),
        BigInt.fromI32(3600 * 24 * 30 * 6),
        BigInt.fromString(BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000')).toString()),
        BigInt.fromI32(1680267154)
    );

    handleLoanAdded(loanAddedEvent);

    const loanClaimed = createLoanClaimedEvent(userAddress[0], BigInt.fromI32(1));

    handleLoanClaimed(loanClaimed);

    assert.fieldEquals('MicroCredit', '0', 'borrowers', '1');
    assert.fieldEquals('MicroCredit', '0', 'borrowed', '[borrowed-0x874069fa1eb16d44d622f2e0ca25eea172369bc1-0]');
    assert.fieldEquals('Asset', 'borrowed-0x874069fa1eb16d44d622f2e0ca25eea172369bc1-0', 'amount', '10');
    assert.fieldEquals('Loan', `${userAddress[0]}-1`, 'isClaimed', '1');
});

test('[handleLoanAdded] register', () => {
    clearStore();

    const loanAddedEvent = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(1),
        toToken('10'),
        BigInt.fromI32(3600 * 24 * 30 * 6),
        BigInt.fromString(BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000')).toString()),
        BigInt.fromI32(1680267154)
    );

    handleLoanAdded(loanAddedEvent);

    // assert Loan entity
    assert.fieldEquals('Loan', `${userAddress[0]}-1`, 'borrower', userAddress[0]);
    assert.fieldEquals('Loan', `${userAddress[0]}-1`, 'amount', '10');
    assert.fieldEquals('Loan', `${userAddress[0]}-1`, 'period', BigInt.fromI32(3600 * 24 * 30 * 6).toString());
    assert.fieldEquals('Loan', `${userAddress[0]}-1`, 'isClaimed', '0');
    assert.fieldEquals('Loan', `${userAddress[0]}-1`, 'repayed', '0');

    assert.entityCount('MicroCredit', 0);
});

test('[handleUserAddressChanged] change address', () => {
    clearStore();

    const loanAddedEvent = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(1),
        toToken('10'),
        BigInt.fromI32(3600 * 24 * 30 * 6),
        BigInt.fromString(BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000')).toString()),
        BigInt.fromI32(1680267154)
    );

    handleLoanAdded(loanAddedEvent);

    const loanClaimed = createLoanClaimedEvent(userAddress[0], BigInt.fromI32(1));

    handleLoanClaimed(loanClaimed);

    const userAddressChangedEvent = createUserAddressChangedEvent(userAddress[0], userAddress[1]);

    handleUserAddressChanged(userAddressChangedEvent);

    // assert Borrower entity id change
    assert.entityCount('Borrower', 1);
    assert.notInStore('Borrower', userAddress[0]);
    assert.fieldEquals('Borrower', userAddress[1], 'loans', '[1]');
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

    const ManagerAddedEvent = createManagerAddedEvent(userAddress[0]);

    handleManagerRemoved(ManagerAddedEvent);

    assert.entityCount('LoanManager', 1);
    assert.fieldEquals('LoanManager', userAddress[0], 'state', '1');
});

test('[handleRepaymentAdded]', () => {
    clearStore();

    const loanAddedEvent = createLoanAddedEvent(
        userAddress[0],
        BigInt.fromI32(1),
        toToken('10'),
        BigInt.fromI32(3600 * 24 * 30 * 6),
        BigInt.fromString(BigDecimal.fromString('0.12').times(BigDecimal.fromString('1000000000000000000')).toString()),
        BigInt.fromI32(1680267154)
    );

    handleLoanAdded(loanAddedEvent);

    const RepaymentAddedEvent = createRepaidEvent(userAddress[0], BigInt.fromI32(1), toToken('10'));

    handleRepaymentAdded(RepaymentAddedEvent);

    assert.entityCount('Loan', 1);
    assert.fieldEquals('Loan', `${userAddress[0]}-1`, 'repayed', '10');
});
