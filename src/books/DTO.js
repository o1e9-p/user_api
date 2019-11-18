import AuthorDTO from "../author/DTO";

export default class BookDTO {
  constructor({ id, title, date, first_name, last_name, description, image }) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.author = new AuthorDTO(first_name, last_name);
    this.description = description;
    this.image = image;
  }
}
