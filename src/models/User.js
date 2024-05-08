/**
 * User model
 */
class User {
  constructor(data = {}) {
    this.id = null;
    this.username = null;
    this.token = null;
    this.status = null;
    this.birthDate = null;
    Object.assign(this, data);
  }
}

export default User;
