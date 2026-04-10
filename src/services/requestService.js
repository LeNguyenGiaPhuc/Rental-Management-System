const db = require('../config/db');
const { withAuth } = require('../utils/withAuth');
const Request = require('../models/Request');

const mapPriorityForDb = (priority) => {
  if (priority === 'Low Priority') return 'Low';
  if (priority === 'High Priority') return 'High';
  return 'Medium';
};

const getAllRequests = async (user, { status, tenant } = {}) => {
  try {
    let query = db('requests')
      .leftJoin('users', 'requests.tenant_id', 'users.id')
      .leftJoin('contracts', function() {
        this.on('users.id', '=', 'contracts.tenant_id')
            .andOn('contracts.status', '=', db.raw('?', ['Active']));
      })
      .leftJoin('rooms', 'contracts.room_id', 'rooms.id')
      .select(
        'requests.*',
        'users.full_name as tenant_name',
        'rooms.room_number'
      );

    if (status && status !== 'All') {
      query = query.where('requests.status', status);
    }

    if (user && user.role === 'Tenant') {
      query = query.where('requests.tenant_id', user.id);
    } else if (tenant && tenant.trim()) {
      query = query.where('users.full_name', 'ilike', `%${tenant.trim()}%`);
    }

    query = query.orderByRaw(
      "CASE requests.priority WHEN 'High' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Low' THEN 3 ELSE 4 END, " +
      "CASE requests.status WHEN 'Pending' THEN 1 WHEN 'In Progress' THEN 2 WHEN 'Completed' THEN 3 ELSE 4 END, " +
      'requests.created_at DESC'
    );

    const dbRequests = await query;

    return dbRequests.map(req => ({
      id: req.id,
      tenantId: req.tenant_id,
      tenant: req.tenant_name || 'Unknown Tenant',
      type: req.type,
      priority: req.priority === 'Low' ? 'Low Priority' :
                req.priority === 'High' ? 'High Priority' : 'Medium Priority',
      title: req.title,
      description: req.description,
      estimatedCost: req.estimated_cost || 0,
      status: req.status,
      createdAt: req.created_at,
      date: new Date(req.created_at).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }),
      room: req.room_number || 'Unknown Room'
    }));
  } catch (error) {
    console.error('Failed to load requests from Supabase:', error.message || error);
    return [];
  }
};

const findRequestById = async (id) => {
  try {
    const request = await db('requests')
      .leftJoin('users', 'requests.tenant_id', 'users.id')
      .leftJoin('contracts', function() {
        this.on('users.id', '=', 'contracts.tenant_id')
            .andOn('contracts.status', '=', db.raw('?', ['Active']));
      })
      .leftJoin('rooms', 'contracts.room_id', 'rooms.id')
      .where('requests.id', id)
      .select(
        'requests.*',
        'users.full_name as tenant_name',
        'rooms.room_number'
      )
      .first();

    if (!request) return null;
    return {
      id: request.id,
      tenantId: request.tenant_id,
      tenant: request.tenant_name || 'Unknown Tenant',
      type: request.type,
      priority: request.priority === 'Low' ? 'Low Priority' :
                request.priority === 'High' ? 'High Priority' : 'Medium Priority',
      title: request.title,
      description: request.description,
      estimatedCost: request.estimated_cost || 0,
      status: request.status,
      createdAt: request.created_at,
      date: new Date(request.created_at).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }),
      room: request.room_number || 'Unknown Room'
    };
  } catch (error) {
    console.error('Failed to find request from Supabase:', error.message || error);
    return null;
  }
};

const getTenantRoom = async (tenantId) => {
  if (!tenantId) return null;
  const contract = await db('contracts')
    .join('rooms', 'contracts.room_id', 'rooms.id')
    .where('contracts.tenant_id', tenantId)
    .andWhere('contracts.status', 'Active')
    .select('rooms.room_number')
    .first();

  return contract ? contract.room_number : null;
};

const createRequest = async (user, { tenantId, tenant, type, priority, title, description, estimatedCost, room } = {}) => {
  // prefer tenantId from verified user if available
  const resolvedTenantId = tenantId || (user && user.id) || null;
  const resolvedTenantName = tenant || (user && user.full_name) || 'Tenant';
  const createdRoom = room || await getTenantRoom(resolvedTenantId) || 'Unknown';

  const dbPayload = {
    tenant_id: resolvedTenantId,
    type,
    priority: mapPriorityForDb(priority),
    title,
    description,
    estimated_cost: estimatedCost || 0,
    status: 'Pending',
    created_at: new Date().toISOString()
  };

  try {
    const [insertedRequest] = await db('requests').insert(dbPayload).returning('*');
    return {
      id: insertedRequest.id,
      tenantId: insertedRequest.tenant_id,
      tenant: resolvedTenantName,
      type: insertedRequest.type,
      priority: insertedRequest.priority === 'Low' ? 'Low Priority' :
                insertedRequest.priority === 'High' ? 'High Priority' : 'Medium Priority',
      title: insertedRequest.title,
      description: insertedRequest.description,
      estimatedCost: insertedRequest.estimated_cost || 0,
      status: insertedRequest.status,
      createdAt: insertedRequest.created_at,
      date: new Date(insertedRequest.created_at).toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
      }),
      room: createdRoom
    };
  } catch (error) {
    console.error('Supabase request insert failed:', error.message || error);
    throw error;
  }
};

const startRequest = async (user, id) => {
  const rawRequest = await findRequestById(id);
  if (!rawRequest) {
    throw new Error('Request not found');
  }

  const request = new Request(rawRequest);
  request.startProcessing();

  const newStatus = request.getStatus();
  rawRequest.status = newStatus;

  try {
    await db('requests')
      .where('id', id)
      .update({ status: newStatus });
  } catch (error) {
    console.error('Supabase request update failed:', error.message || error);
  }

  return rawRequest;
};

const completeRequest = async (user, id) => {
  const rawRequest = await findRequestById(id);
  if (!rawRequest) {
    throw new Error('Request not found');
  }

  const request = new Request(rawRequest);
  request.complete();

  const newStatus = request.getStatus();
  rawRequest.status = newStatus;

  try {
    await db('requests')
      .where('id', id)
      .update({
        status: newStatus,
        resolved_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Supabase request update failed:', error.message || error);
  }

  return rawRequest;
};

module.exports = {
  getAllRequests,
  createRequest: withAuth('Tenant', createRequest),
  startRequest: withAuth('Admin', startRequest),
  completeRequest: withAuth('Admin', completeRequest),
  findRequestById
};
