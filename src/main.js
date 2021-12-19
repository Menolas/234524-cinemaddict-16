import {FILM_COUNT} from './const.js';
import UserRankView from './view/user-rank-view.js';
import {render, RenderPosition} from './utils/render.js';
import FilmListPresenter from './presenter/film-list-presenter.js';
import {generateFilmCard} from './mock/film.js';

const siteHeaderElement = document.querySelector('.header');
const siteMainElement = document.querySelector('.main');
const siteFooterElement = document.querySelector('.footer');

const movies = Array.from({length: FILM_COUNT}, generateFilmCard);

const filmListPresenter = new FilmListPresenter(siteMainElement);

render(siteHeaderElement, new UserRankView(), RenderPosition.BEFOREEND);

filmListPresenter.init(movies);

siteFooterElement.querySelector('.footer__statistics span').textContent = FILM_COUNT;
