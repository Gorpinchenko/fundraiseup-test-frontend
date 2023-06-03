function createComponent(text: string) {
  const element = document.createElement("h1");
  element.textContent = text;
  return element;
}

document.body.prepend(createComponent("Проект собран на Webpack"));
