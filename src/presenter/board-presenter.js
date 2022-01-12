import {sortFilmByDate, sortFilmByRate} from '../utils/common.js';
import {render, RenderPosition, remove} from '../utils/render.js';
import FilmBoardView from '../view/film-board-view.js';
//import FilterMenuView from '../view/filter-menu-view.js';
import SortListView from '../view/sort-list-view.js';
import FilmContainerView from '../view/film-container-view.js';
import FilmListContainerView from '../view/film-list-container-view.js';
import NoFilmView from '../view/no-film-view.js';
import FilmPresenter from './film-presenter.js';
import ShowMoreButtonView from '../view/show-more-button-view.js';
import {SortType, FilterType, UpdateType, UserAction} from '../const.js';
import {filter} from '../utils/filter.js';

import {FILM_COUNT_PER_STEP} from '../const.js';

const siteMainElement = document.querySelector('.main');

export default class BoardPresenter {
  #boardContainer = null;
  #filmsModel = null;
  #filterModel = null;

  #filmBoardComponent = new FilmBoardView();
  #filmContainerComponent = new FilmContainerView();
  #filmListContainerComponent = new FilmListContainerView();
  #showMoreButtonComponent = null;
  #sortListComponent = null;
  #filterMenuComponent = null;

  #renderedFilmCount = FILM_COUNT_PER_STEP;
  #filmPresenter = new Map();
  #currentSortType = SortType.DEFAULT;
  #currentFilterType = FilterType.DEFAULT;
  #noFilmComponent = new NoFilmView(this.#currentFilterType);

  constructor(boardContainer, filmsModel, filterModel) {
    this.#boardContainer = boardContainer;
    this.#filmsModel = filmsModel;
    this.#filterModel = filterModel;

    this.#filmsModel.addObserver(this.#handleModelEvent);
    this.#filterModel.addObserver(this.#handleModelEvent);
  }

  get films() {
    const filterType = this.#filterModel.filter;
    const films = this.#filmsModel.films;
    const filteredFilms = filter[filterType](films);

    switch (this.#currentSortType) {
      case SortType.DATE:
        return filteredFilms.sort(sortFilmByDate);
      case SortType.RATE:
        return filteredFilms.sort(sortFilmByRate);
    }

    return filteredFilms;
  }

  init = () => {
    render(this.#boardContainer, this.#filmBoardComponent, RenderPosition.BEFOREEND);
    render(this.#filmBoardComponent, this.#filmContainerComponent, RenderPosition.BEFOREEND);

    this.#renderBoard();
  }

  #handleModeChange = () => {

    this.#filmPresenter.forEach((presenter) => presenter.resetView());
  }
  
  #handleViewAction = (actionType, updateType, update) => {
    switch (actionType) {
      case UserAction.UPDATE_FILM:
        this.#filmsModel.updateFilm(updateType, update);
        break;
      case UserAction.ADD_COMMENT:
        this.#filmsModel.addFilm(updateType, update);
        break;
      case UserAction.DELETE_COMMENT:
        this.#filmsModel.deleteFilm(updateType, update);
        break;
    }
  }

  #handleModelEvent = (updateType, data) => {
    
    switch (updateType) {
      case UpdateType.PATCH:
        this.#filmPresenter.get(data.id).init(data);
        break;
      case UpdateType.MINOR:
        this.#clearBoard();
        this.#renderBoard();
        break;
      case UpdateType.MAJOR:
        this.#clearBoard({resetRenderedTaskCount: true, resetSortType: true});
        this.#renderBoard();
        break;
    }
  }

  #filterFilms = () => {

    switch (this.#currentFilterType) {
      case FilterType.FAVOURITES:
      return [...this.films].filter((film) => film.isFavourite);
      case FilterType.WATCHED:
      return [...this.films].filter((film) => film.isWatched);
      case FilterType.WATCHLIST:
      return [...this.films].filter((film) => film.isInWatchlist);
    }
  }

  #handleFilterTypeChange = (filterType) => {
    if (this.#currentFilterType === filterType) {
      return;
    }
    
    this.#currentFilterType = filterType;
    this.#clearBoard({resetRenderedTaskCount: true});
    this.#filterFilms();

    if (!this.films.length) {
      //this.#renderFilter();
      this.#noFilmComponent = new NoFilmView(this.#currentFilterType);
      render(this.#filmContainerComponent, this.#noFilmComponent, RenderPosition.BEFOREEND);

      return;
    }

    this.#renderBoard();
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }

    this.#currentSortType = sortType;
    this.#clearBoard({resetRenderedTaskCount: true});
    this.#renderBoard();
  }

  // #renderFilter = () => {
  //   this.#filterMenuComponent = new FilterMenuView(this.films, this.#currentFilterType);
  //   this.#filterMenuComponent.setFilterTypeChangeHandler(this.#handleFilterTypeChange);

  //   render(siteMainElement, this.#filterMenuComponent, RenderPosition.AFTERBEGIN);
  // }

  #renderSort = () => {
    this.#sortListComponent = new SortListView(this.#currentSortType);
    this.#sortListComponent.setSortTypeChangeHandler(this.#handleSortTypeChange);

    render(this.#filmBoardComponent, this.#sortListComponent, RenderPosition.BEFOREBEGIN);
  }

  #renderFilm = (film) => {
    const filmPresenter = new FilmPresenter(this.#filmListContainerComponent, this.#handleViewAction, this.#handleModeChange);
    filmPresenter.init(film);
    this.#filmPresenter.set(film.id, filmPresenter);
  }

  #renderFilms = (films) => {
    films.forEach((film) => this.#renderFilm(film));
  }

  #handleShowMoreButtonClick = () => {
    const filmCount = this.films.length;
    const newRenderedFilmCount = Math.min(filmCount, this.#renderedFilmCount + FILM_COUNT_PER_STEP);
    const films = this.films.slice(this.#renderedFilmCount, newRenderedFilmCount);

    this.#renderFilms(films);
    this.#renderedFilmCount = newRenderedFilmCount;

    if (this.#renderedFilmCount >= filmCount) {
      remove(this.#showMoreButtonComponent);
    }
  }

  #renderShowMoreButton = () => {
    this.#showMoreButtonComponent = new ShowMoreButtonView();
    this.#showMoreButtonComponent.setClickHandler(this.#handleShowMoreButtonClick);

    render(this.#filmListContainerComponent, this.#showMoreButtonComponent, RenderPosition.AFTEREND);
  }

  #clearFilmList = () => {
    this.#filmPresenter.forEach((presenter) => presenter.destroy());
    this.#filmPresenter.clear();
    this.#renderedFilmCount = FILM_COUNT_PER_STEP;
    remove(this.#showMoreButtonComponent);
  }

  #renderFilmList = () => {
    const filmCount = this.films.length;
    const films = this.films.slice(0, Math.min(filmCount, FILM_COUNT_PER_STEP));
    
    this.#renderFilms(films);

    if (filmCount > FILM_COUNT_PER_STEP) {
      this.#renderShowMoreButton();
    }
  }

  #clearBoard = ({resetRenderedFilmCount = false, resetSortType = false} = {}) => {

    const filmCount = this.films.length;

    this.#filmPresenter.forEach((presenter) => presenter.destroy());
    this.#filmPresenter.clear();
    
    remove(this.#filterMenuComponent);
    remove(this.#sortListComponent);
    remove(this.#noFilmComponent);
    remove(this.#showMoreButtonComponent);

    if (resetRenderedFilmCount) {
      this.#renderedFilmCount = FILM_COUNT_PER_STEP;
    } else {
     
      this.#renderedFilmCount = Math.min(filmCount, this.#renderedFilmCount);
    }

    if (resetSortType) {
      this.#currentSortType = SortType.DEFAULT;
    }

  }

  #renderBoard = () => {
    const films = this.films;
    const filmCount = films.length;

    //this.#renderFilter();

    if (filmCount === 0) {
      render(this.#filmContainerComponent, this.#noFilmComponent, RenderPosition.BEFOREEND);
      return;
    }
    
    this.#renderSort();

    render(this.#filmContainerComponent, this.#filmListContainerComponent, RenderPosition.BEFOREEND);

    this.#renderFilms(films.slice(0, Math.min(filmCount, this.#renderedFilmCount)));

    if (filmCount > this.#renderedFilmCount) {
      this.#renderShowMoreButton();
    }
  }
}