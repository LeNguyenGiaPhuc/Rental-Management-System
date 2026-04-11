const bcrypt = require('bcryptjs');

class User {
  constructor(data, role) {
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone = data.phone;
    
    if (data.password) {
      this.password_hash = bcrypt.hashSync(data.password, 8);
    } else {
      this.password_hash = data.password_hash || ""; 
    }

    this.id_card = data.id_card;
    this.dob = data.dob;
    this.hometown = data.hometown;
    this.gender = data.gender;
    this.avatar_url = data.avatar_url || "/img/default-avatar.png";
    this.role = role;
    this.is_active = true;
  }
}

class Tenant extends User {
  constructor(data) {
    super(data, "Tenant"); 
  }
}

class Admin extends User {
  constructor(data) {
    super(data, "Admin");
  }
}

class UserFactory {
  static createUser(role, data) {
    switch (role) {
      case "Admin":
        return new Admin(data);
      case "Tenant":
      default:
        return new Tenant(data);
    }
  }
}

module.exports = UserFactory;