const { mysql } = require("../config/connect");

module.exports = {
  addUserTransaction: async(userId, money_transaction, transaction_content, transaction_type, transaction_status) => {
    try{
      const result = await mysql.query(
        `INSERT INTO user_transaction_history(user_id, transaction_time, money_transaction, transaction_content, transaction_type, transaction_status) VALUES(${Number(userId)}, now(),  '${money_transaction}', '${transaction_content}', '${transaction_type}', ${transaction_status})`
      );
      const lastId = await mysql.query(`SELECT LAST_INSERT_ID() as transfer_id FROM user_transaction_history`)
      if (result) return {status: true, transferId: lastId[0]?.transfer_id}
      return {status: false}
    }catch(error){
      return {status: false}
    }
  },

  updateUserAmount: async(userId, money) => {
    try{
      const result = await mysql.query(
        `UPDATE user SET amount=${Number(money)} WHERE user_id=${Number(userId)}`
      );
      if (result) return true;
      return false;
    }catch(error){
      return false
    }
  },

  getUserAmount: async(userId) => {
    try{
      const result = await mysql.query(
        `SELECT amount FROM user WHERE user_id=${Number(userId)}`
      );
      if (result) return result[0]?.amount;
      return false;
    }catch(error){
      return false
    }
  },

  countUserTodayTransaction: async(type) => {
    try{
      const result = await mysql.query(`SELECT COUNT(*) AS count_transaction
      FROM user_transaction_history 
      WHERE DATE(transaction_time) = CURDATE() AND transaction_type='${type}'`)

      if ( result ){
        return result[0]?.count_transaction
      }
      return -1

    }catch(error){
      return -1
    }
  },

  getUserTransaction: async(userID) => {
    try{
      const result = await mysql.query(`SELECT uth.*, ttd.transfer_fee, ttd.transfer_fee_bearer  FROM user_transaction_history uth LEFT JOIN transaction_transfers_detail ttd ON uth.transaction_id = ttd.transaction_id  WHERE uth.user_id=${Number(userID)}`)
      if ( result?.length ){
        return result
      }
      return []

    }catch(error){
      return []
    }
  },

  getTransactionById: async(transactionID) => {
    try{
      const result = await mysql.query(`SELECT uth.*, usr.name AS mover_name FROM user_transaction_history uth JOIN user usr ON uth.user_id = usr.user_id WHERE transaction_id=${Number(transactionID)}`)
      if ( result?.length ){
        return result[0]
      }
      return {}
    }catch(error){
      return {}
    }
  },

  getListTransaction: async() => {
    try{
      const listTransaction = await mysql.query(`SELECT *, usr.name AS user_name FROM user_transaction_history uth JOIN user usr ON uth.user_id = usr.user_id ORDER BY uth.transaction_time ASC`)
      if ( listTransaction?.length ){
        return listTransaction
      }
      return []
    }catch(error){
      return []
    }
  },

  getUserFromTransactionId: async(transactionId) => {
    try{
      const user = await mysql.query(`SELECT usr.* FROM user_transaction_history uth JOIN user usr ON uth.user_id = usr.user_id WHERE uth.transaction_id = ${Number(transactionId)}`)
      if ( user ) return user
      return {}
    }catch(error){
      return {}
    }
  },

  updateTransactionStatus: async(transactionId, status) => {
    try{
      const updateResult = await mysql.query(`UPDATE user_transaction_history SET transaction_status=${status} WHERE transaction_id=${Number(transactionId)}`)
      if ( updateResult ) return true
      return false
    }
    catch(error){
      return false
    }
  },

  addTransferDetail: async(transactionId, receiverId, transferFee, transferFeeBearer) => {
    try{
      const addRes = await mysql.query(`INSERT INTO transaction_transfers_detail(transaction_id, receiver_id, transfer_fee, transfer_fee_bearer) VALUES(${Number(transactionId)}, ${Number(receiverId)}, '${transferFee}', '${transferFeeBearer}')`)
    } catch(error){
      return false
    }
  },

  getTransferByTransactionId: async(transactionId) => {
    try{
      const transfer = await mysql.query(`SELECT usr.name AS receiver_name, ttd.* FROM transaction_transfers_detail ttd JOIN user usr ON ttd.receiver_id = usr.user_id WHERE transaction_id=${Number(transactionId)}`)
      if ( transfer?.length ){
        return transfer[0]
      }
      return {}
    } catch(error){
      return {}
    }
  },

  getTransferByUserId: async(userId) => {
    try{
      const transfer = await mysql.query(`SELECT usr.name AS receiver_name, ttd.*, uth.* FROM transaction_transfers_detail ttd JOIN user usr ON ttd.receiver_id = usr.user_id JOIN user_transaction_history uth ON uth.transaction_id = ttd.transaction_id WHERE receiver_id=${Number(userId)}`)
      if ( transfer?.length ){
        return transfer
      }
      return []
    }catch(error){
      return []
    }
  },



}