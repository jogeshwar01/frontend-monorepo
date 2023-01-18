import { removeDecimal } from '@vegaprotocol/cypress';
import * as Schema from '@vegaprotocol/types';
import {
  OrderStatusMapping,
  OrderTimeInForceMapping,
  OrderTypeMapping,
  Side,
} from '@vegaprotocol/types';
import { isBefore, isAfter, addSeconds, subSeconds } from 'date-fns';
import { createOrder } from '../support/create-order';

const orderSize = 'size';
const orderType = 'type';
const orderStatus = 'status';
const orderRemaining = 'remaining';
const orderPrice = 'price';
const orderTimeInForce = 'timeInForce';
const orderCreatedAt = 'createdAt';
const orderUpdatedAt = 'updatedAt';

// TODO: ensure this test runs only if capsule is running via workflow
describe('capsule', { tags: '@slow' }, () => {
  before(() => {
    cy.createMarket();
    cy.get('@markets').then((markets) => {
      cy.wrap(markets[0]).as('market');
    });
  });

  beforeEach(() => {
    cy.setVegaWallet();
  });

  it('can place and receive an order', function () {
    const market = this.market;
    cy.visit(`/#/markets/${market.id}`);
    const order = {
      marketId: market.id,
      type: Schema.OrderType.TYPE_LIMIT,
      side: Schema.Side.SIDE_BUY,
      size: '0.0005',
      price: '390',
      timeInForce: Schema.OrderTimeInForce.TIME_IN_FORCE_GTC,
    };
    const rawPrice = removeDecimal(order.price, market.decimalPlaces);
    const rawSize = removeDecimal(order.size, market.positionDecimalPlaces);

    createOrder(order);

    cy.getByTestId('dialog-title').should(
      'contain.text',
      'Awaiting network confirmation'
    );
    cy.getByTestId('dialog-title').should('contain.text', 'Order submitted');
    cy.getByTestId('dialog-close').click();

    // orderbook cells are keyed by price level
    cy.getByTestId('tab-orderbook')
      .get(`[data-testid="price-${rawPrice}"]`)
      .should('contain.text', order.price)
      .get(`[data-testid="bid-vol-${rawPrice}"]`)
      .should('contain.text', rawSize);

    cy.getByTestId('Orders').click();
    cy.getByTestId('tab-orders').within(() => {
      cy.get('.ag-center-cols-container')
        .children()
        .first()
        .within(() => {
          cy.get(`[col-id='${orderSize}']`).should(
            'contain.text',
            order.side === Side.SIDE_BUY ? '+' : '-' + order.size
          );

          cy.get(`[col-id='${orderType}']`).should(
            'contain.text',
            OrderTypeMapping[order.type]
          );

          cy.get(`[col-id='${orderStatus}']`).should(
            'contain.text',
            OrderStatusMapping.STATUS_ACTIVE
          );

          cy.get(`[col-id='${orderRemaining}']`).should(
            'contain.text',
            `0.00/${order.size}`
          );

          cy.get(`[col-id='${orderPrice}']`).then(($price) => {
            expect(parseFloat($price.text())).to.equal(parseFloat(order.price));
          });

          cy.get(`[col-id='${orderTimeInForce}']`).should(
            'contain.text',
            OrderTimeInForceMapping[order.timeInForce]
          );

          checkIfDataAndTimeOfCreationAndUpdateIsEqual(orderCreatedAt);
        });
    });

    cy.getByTestId('edit').first().click();
    cy.getByTestId('dialog-title').should('contain.text', 'Edit order');
    cy.get('#limitPrice').focus().clear().type('200');
    cy.getByTestId('edit-order').find('[type="submit"]').click();
    cy.getByTestId('dialog-title').should('contain.text', 'Order updated');
    cy.getByTestId('dialog-close').click();

    cy.get('.ag-center-cols-container')
      .children()
      .first()
      .within(() => {
        cy.get(`[col-id='${orderPrice}']`).then(($price) => {
          expect(parseFloat($price.text())).to.equal(parseFloat('200'));
        });
        checkIfDataAndTimeOfCreationAndUpdateIsEqual(orderUpdatedAt);
      });

    cy.getByTestId('cancel').first().click();

    cy.getByTestId('dialog-title').should(
      'contain.text',
      'Awaiting network confirmation'
    );
    cy.getByTestId('dialog-title').should('contain.text', 'Order cancelled');
    cy.getByTestId('dialog-close').click();

    cy.getByTestId('tab-orders')
      .get('.ag-center-cols-container')
      .children()
      .first()
      .get(`[col-id='${orderStatus}']`)
      .should('contain.text', OrderStatusMapping.STATUS_CANCELLED);
  });
});
function checkIfDataAndTimeOfCreationAndUpdateIsEqual(date: string) {
  cy.get(`[col-id='${date}']`)
    .children('span')
    .invoke('data', 'value')
    .then(($dateTime) => {
      // allow a date 5 seconds either side to allow for
      // unexpected latency
      const minBefore = subSeconds(new Date(), 5);
      const maxAfter = addSeconds(new Date(), 5);
      console.log(maxAfter);
      const date = new Date($dateTime.toString());
      expect(isAfter(date, minBefore) && isBefore(date, maxAfter)).to.equal(
        true
      );
    });
}