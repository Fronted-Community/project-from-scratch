import './style.css'
import './less-style.less'

function component(classname: string, innerText: string ) {
  const element = document.createElement('div');
  element.innerHTML = innerText;
  element.classList.add(classname);

  return element;
}

document.body.appendChild(component('hello', 'Hello webpack'));
document.body.appendChild(component('main', 'mian element'));
