export default class AuthorDTO {
  constructor(firstName, lastName, id) {
    if (id) {
      this.id = id;
    }
    if (firstName) {
      this.firstName = firstName;
    }
    if (firstName) {
      this.lastName = lastName;
    }
  }
}
