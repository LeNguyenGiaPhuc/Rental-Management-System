const db = require('../config/db');

class TenantService {
    static async getAllTenants() {
        const tenants = await db('users')
            .leftJoin('rooms', 'users.id', 'rooms.tenant_id')
            .leftJoin('contracts', function() {
                this.on('users.id', '=', 'contracts.tenant_id')
                    .andOn('contracts.status', '=', db.raw('?', ['Active']))
            })
            .where('users.role', 'Tenant')
            .select(
                'users.*',
                'rooms.room_number',
                'contracts.start_date as move_in_date'
            )
            .orderBy('users.created_at', 'desc');

        return tenants;
    }
}

module.exports = TenantService;