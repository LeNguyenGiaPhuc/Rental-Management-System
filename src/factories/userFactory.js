class Tenant {
  constructor(data) {
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone = data.phone;
    this.password_hash = data.password;

    this.id_card = data.id_card;
    this.dob = data.dob;
    this.hometown = data.hometown;
    this.gender = data.gender;
    this.avatar_url = data.avatar_url || "/img/default-avatar.png";
    this.role = "Tenant";
    this.is_active = true;
  }
}

class Admin {
  constructor(data) {
    this.full_name = data.full_name;
    this.email = data.email;
    this.phone = data.phone;
    this.password_hash = data.password;

    this.id_card = data.id_card;
    this.dob = data.dob;
    this.hometown = data.hometown;
    this.gender = data.gender;
    this.avatar_url = data.avatar_url || "/img/default-avatar.png";
    this.role = "Admin";
    this.is_active = true;
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
