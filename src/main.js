import {FILM_COUNT, FILM_COUNT_PER_STEP} from './const.js';
import UserRankView from './view/user-rank-view.js';
import SiteMenuView from './view/site-menu-view.js';
import FilmBoardView from './view/film-board-view.js';
import FilmContainerView from './view/film-container-view.js';
import SortListView from './view/sort-list-view.js';
import ShowMoreButtonView from './view/show-more-button-view.js';
import FilmCardView from './view/film-card-view.js';
import DetailedInfoView from './view/detailed-info-view.js';
import CommentView from './view/comment-view.js';
import NoFilmView from './view/no-film-view.js';
import {render, RenderPosition} from './utils/render.js';
import {generateFilmCard} from './mock/film.js';
import {generateComment} from './mock/comment.js';
const body = document.querySelector('body');
const siteHeaderElement = document.querySelector('.header');
const siteMainElement = document.querySelector('.main');
const siteFooterElement = document.querySelector('.footer');

const films = Array.from({length: FILM_COUNT}, generateFilmCard);
export const filteredData = {
  watchList: films.filter((el) => el.isInWatchlist).length,
  watchedList: films.filter((el) => el.isWatched).length,
  favourites: films.filter((el) => el.isInFavourites).length,
};

const renderFilm = (filmListElement, film) => {
  const filmComponent = new FilmCardView(film);
  const detailedFilmComponent = new DetailedInfoView(film);
  const closePopup = () => {
    siteFooterElement.removeChild(detailedFilmComponent.element);
    body.classList.remove('hide-overflow');
  };

  const showPopup = () => {
    siteFooterElement.appendChild(detailedFilmComponent.element);
    body.classList.add('hide-overflow');

    const commentsContainer = document.querySelector('.film-details__comments-list');

    if (commentsContainer && film.commentsNumber) {
      const comments = Array.from({length: film.commentsNumber}, generateComment);
      for (const comment of comments) {
        render(commentsContainer, new CommentView(comment), RenderPosition.AFTERBEGIN);
      }
    }
  };

  const onEscKeyDown = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      closePopup();
      document.removeEventListener('keydown', onEscKeyDown);
    }
  };

  detailedFilmComponent.setClosePopupClickHandler(() => {
    closePopup();
    document.removeEventListener('keydown', onEscKeyDown);
  });

  filmComponent.setPopupClickHandler(() => {
    showPopup();
    document.addEventListener('keydown', onEscKeyDown);
  });

  render(filmListElement, filmComponent, RenderPosition.BEFOREEND);
};

const renderFilmBoard = (container, cards) => {
  const filmBoardViewComponent = new FilmBoardView();
  const filmContainerViewComponent = new FilmContainerView();

  render(siteHeaderElement, new UserRankView(), RenderPosition.BEFOREEND);
  render(container, new SiteMenuView(), RenderPosition.AFTERBEGIN);
  render(container, filmBoardViewComponent, RenderPosition.BEFOREEND);
  render(filmBoardViewComponent, filmContainerViewComponent, RenderPosition.BEFOREEND);

  if (!cards.length) {
    render(filmBoardViewComponent, new NoFilmView(), RenderPosition.BEFOREEND);
  } else {
    render(filmBoardViewComponent, new SortListView(), RenderPosition.BEFOREBEGIN);
    const allMoviesContainer = filmBoardViewComponent.element.querySelector('.films-list__container');
    
    cards
      .slice(0, Math.min(FILM_COUNT, FILM_COUNT_PER_STEP))
      .forEach((card) => renderFilm(allMoviesContainer, card));

    if (cards.length > FILM_COUNT_PER_STEP) {
      let renderedFilmCount = FILM_COUNT_PER_STEP;
      const showMoreButtonComponent = new ShowMoreButtonView();
      render(allMoviesContainer, showMoreButtonComponent, RenderPosition.AFTEREND);

      showMoreButtonComponent.setClickHandler(() => {

        cards
          .slice(renderedFilmCount, renderedFilmCount + FILM_COUNT_PER_STEP)
          .forEach((card) => renderFilm(allMoviesContainer, card));
        renderedFilmCount += FILM_COUNT_PER_STEP;

        if (renderedFilmCount >= cards.length) {
          showMoreButtonComponent.remove();
        }
      });
    }
  }

  siteFooterElement.querySelector('.footer__statistics span').textContent = FILM_COUNT;
};

renderFilmBoard(siteMainElement, films);
