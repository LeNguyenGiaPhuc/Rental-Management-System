const db = require('../config/db');
const UserFactory = require('../factories/userFactory');

class AccountService {

  static async createAccount(accountData) {
    const trx = await db.transaction();

    try {
      const userObj = UserFactory.createUser(
        accountData.role,
        accountData
      );

      const plainUserObject = Object.assign({}, userObj);

      const [newUser] = await trx('users')
        .insert(plainUserObject) 
        .returning('*');

      if (accountData.room_id) {

        await trx('rooms')
          .where('id', accountData.room_id)
          .update({
            tenant_id: newUser.id,
            status: 'Occupied'
          });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1);

        await trx('contracts').insert({
          tenant_id: newUser.id,
          room_id: accountData.room_id,
          start_date: startDate,
          end_date: endDate,
          status: 'Active'
        });
      }

      await trx.commit();
      return newUser;

    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  static async updateAccount(userId, updateData) {
    const trx = await db.transaction();

    try {
      const { full_name, email, phone, role, password, room_id } = updateData;

      const dataToUpdate = {
        full_name,
        email,
        phone,
        role
      };

      if (password && password.trim() !== '') {
        dataToUpdate.password_hash = password;
      }

      const [updatedUser] = await trx('users')
        .where('id', userId)
        .update(dataToUpdate)
        .returning('*');

      if (room_id) {

        await trx('rooms')
          .where('tenant_id', userId)
          .update({
            tenant_id: null,
            status: 'Available'
          });

        await trx('contracts')
          .where('tenant_id', userId)
          .andWhere('status', 'Active')
          .update({
            status: 'Terminated',
            end_date: new Date()
          });

        await trx('rooms')
          .where('id', room_id)
          .update({
            tenant_id: userId,
            status: 'Occupied'
          });

        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 1);

        await trx('contracts').insert({
          tenant_id: userId,
          room_id: room_id,
          start_date: startDate,
          end_date: endDate,
          status: 'Active'
        });
      }

      await trx.commit();
      return updatedUser;

    } catch (error) {
      await trx.rollback();
      throw new Error("Lỗi khi cập nhật account!");
    }
  }

    static async deleteAccount(userId) {
    const trx = await db.transaction();

    try {
      await trx('rooms')
        .where('tenant_id', userId)
        .update({
          tenant_id: null,
          status: 'Available'
        });

      await trx('contracts')
        .where('tenant_id', userId)
        .del();

      await trx('users')
        .where('id', userId)
        .del();

      await trx.commit();
      return true;

    } catch (error) {
      await trx.rollback();
      throw new Error("Lỗi khi xóa account!");
    }
  }
}

module.exports = AccountService;