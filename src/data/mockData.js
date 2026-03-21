
module.exports = {
  accounts: [
    { name: 'Jane Tenant', phone: '0987654321', email: 'jane@email.com', role: 'Tenant', status: 'Active' },
    { name: 'Bob Smith', phone: '1112223333', email: 'bob@email.com', role: 'Tenant', status: 'Active' },
    { name: 'Alice Johnson', phone: '4445556666', email: 'alice@email.com', role: 'Tenant', status: 'Inactive' },
    { name: 'Charlie Brown', phone: '7778889999', email: 'charlie@email.com', role: 'Tenant', status: 'Active' }
  ],

  adminRooms: [
    { id: 'Room 101', location: 'Manhattan, NY', price: '$1200', status: 'Available', tenant: '-' },
    { id: 'Room 102', location: 'Brooklyn, NY', price: '$850', status: 'Occupied', tenant: 'Jane Tenant' },
    { id: 'Room 201', location: 'Queens, NY', price: '$950', status: 'Pending', tenant: '-' },
    { id: 'Room 202', location: 'Bronx, NY', price: '$780', status: 'Occupied', tenant: 'Bob Smith' },
    { id: 'Room 301', location: 'Upper East Side, NY', price: '$1500', status: 'Available', tenant: '-' }
  ],

  tenants: [
    { name: 'Jane Tenant', phone: '0987654321', email: 'jane@email.com', room: 'Room 102', moveIn: '1/15/2025', status: 'Paid' },
    { name: 'Bob Smith', phone: '1112223333', email: 'bob@email.com', room: 'Room 202', moveIn: '2/1/2025', status: 'Pending' },
    { name: 'Charlie Brown', phone: '7778889999', email: 'charlie@email.com', room: 'Room 305', moveIn: '12/10/2024', status: 'Paid' }
  ],

  requests: [
    { 
      type: 'Repair', status: 'Pending', priority: 'High Priority', 
      description: 'Leaking faucet in bathroom', 
      tenant: 'Jane Tenant', room: 'Room 102', date: '3/18/2026' 
    },
    { 
      type: 'Installation', status: 'In Progress', priority: 'Medium Priority', 
      description: 'Install air conditioner', 
      tenant: 'Bob Smith', room: 'Room 202', date: '3/17/2026' 
    },
    { 
      type: 'Repair', status: 'Completed', priority: 'Low Priority', 
      description: 'Broken window latch', 
      tenant: 'Charlie Brown', room: 'Room 305', date: '3/15/2026' 
    }
  ],

  revenue: [
    { month: 'March 2026', total: '$5,200', expenses: '$800', net: '$4,400', status: 'Completed' },
    { month: 'February 2026', total: '$4,900', expenses: '$600', net: '$4,300', status: 'Completed' },
    { month: 'January 2026', total: '$5,100', expenses: '$1,200', net: '$3,900', status: 'Completed' },
    { month: 'December 2025', total: '$4,800', expenses: '$500', net: '$4,300', status: 'Completed' }
  ],

  payments: [
    { tenant: 'Jane Tenant', room: 'Room 102', amount: '$850', dueDate: '4/1/2026', paidDate: '3/28/2026', method: 'Bank Transfer', status: 'Paid' },
    { tenant: 'Bob Smith', room: 'Room 202', amount: '$780', dueDate: '4/1/2026', paidDate: '-', method: '-', status: 'Pending' },
    { tenant: 'Charlie Brown', room: 'Room 305', amount: '$900', dueDate: '4/1/2026', paidDate: '3/30/2026', method: 'Credit Card', status: 'Paid' },
    { tenant: 'Alice Johnson', room: 'Room 401', amount: '$950', dueDate: '3/15/2026', paidDate: '-', method: '-', status: 'Overdue' }
  ],

  tenantRequests: [
  {
    id: 1,
    type: "Repair",
    title: "Leaking faucet in bathroom",
    status: "In Progress",
    priority: "High Priority",
    date: "3/15/2026"
  },
  {
    id: 2,
    type: "Installation",
    title: "Install ceiling fan",
    status: "Completed",
    priority: "Low Priority",
    date: "3/10/2026"
  }
  ],

  currentRoom : 
  {
    id: "102",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
    location: "Brooklyn, New York",
    price: 850,
    leaseStart: "2/1/2025",
    leaseEnd: "2/1/2026",
    status: "Active",
    amenities: ["Wifi", "Heating", "Furnished", "Laundry"],
    landlord: "John Landlord",
    contact: "1234567890"
  },

  tenantInvoices : [
  {
    id: "INV-2026-04",
    room: "Room 102",
    amount: 850,
    dueDate: "4/1/2026",
    status: "Pending",
    method: "-",
    paidDate: "-"
  },
  {
    id: "INV-2026-03",
    room: "Room 102",
    amount: 850,
    dueDate: "3/1/2026",
    status: "Paid",
    method: "Bank Transfer",
    paidDate: "2/28/2026"
  }]
};