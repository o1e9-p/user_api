
export default class AuthorEntity {
  constructor({ id, authorFirstName, authorLastName }) {
    this.firstName = authorFirstName;
    this.lastName = authorLastName;
    if (id) {
      this.id = id;
    }
  }
}
