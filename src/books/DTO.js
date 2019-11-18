import AuthorDTO from "../author/DTO";

export default class BookDTO {
  constructor({ id, title, date, first_name, last_name, description, image, author }) {
    this.id = id;

    if (title) {
      this.title = title;
    }

    if (date) {
      this.date = date;
    }

    if (first_name || last_name) {
      this.author = new AuthorDTO(first_name, last_name, author);
    }

    if (description) {
      this.description = description;
    }

    if (image) {
      this.image = image;
    }
  }
}
