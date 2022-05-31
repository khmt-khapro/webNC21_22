const VALID_CARD = [
  {
    cardNumber: '111111',
    expiredDate: '10/2022',
    cvv: '411',
    moneyCharge: 'unlimited',
    timeCharge: 'unlimited',
    moneyStatus: 'still'
  },
  {
    cardNumber: '222222',
    expiredDate: '11/2022',
    cvv: '443',
    moneyCharge: 1000000,
    timeCharge: 'unlimited',
    moneyStatus: 'still'
  },
  {
    cardNumber: '333333',
    expiredDate: '12/2022',
    cvv: '577',
    moneyCharge: 'unlimited',
    timeCharge: 'unlimited',
    moneyStatus: 'end'
  },
]

const CARD_WITHDRAW = '111111'
const ADMIN_USR = 'admin'
const ADMIN_PWD = '123456'

const ENUM_NUMBER = {
  VALID_CARD,
  CARD_WITHDRAW,
  ADMIN_USR,
  ADMIN_PWD
};



module.exports = ENUM_NUMBER