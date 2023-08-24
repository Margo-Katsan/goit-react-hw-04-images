import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import { Dna } from 'react-loader-spinner';
import { useEffect, useRef, useState } from 'react';
import { fetchPhotos } from "api";
import { Searchbar } from "./Searchbar/Searchbar";
import { ImageGallery } from "./ImageGallery/ImageGallery";
import { Button } from "./Button/Button";
import css from "./App.module.css"

export const App = () => {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadMoreBtn, setLoadMoreBtn] = useState(false);
  const [wasSearch, setWasSearch] = useState(false);

  const controllerRef = useRef();

  useEffect(() => {
    async function fetchImagesFromAPI() {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
      if (!wasSearch) return;
      controllerRef.current = new AbortController();
      try {
        const queryWithoutId = query.slice(query.indexOf("/") + 1);
        if (queryWithoutId === '') {
          NotificationManager.warning("You didn't enter anything into the search engine");
          return;
        }
        setLoading(true);
        const imagesFromAPI = await fetchPhotos(queryWithoutId, page, controllerRef);
        setImages(prevState => prevState.concat(imagesFromAPI.hits));
        setLoading(false);
        setLoadMoreBtn(true);
      
        if (imagesFromAPI.totalHits === 0) {
          NotificationManager.info('Sorry, there are no images matching your search query. Please try again.')
        }
        if (imagesFromAPI.hits.length === imagesFromAPI.totalHits ||
        imagesFromAPI.totalHits === 0) {
          setLoadMoreBtn(false);
        }
      }
      catch (error) {
        if (error.code !== "ERR_CANCELED") {
          setLoading(false);
          console.log(error);
        setLoadMoreBtn(false);
        NotificationManager.error('Oops! Something went wrong!')
        }
      }
    }
    fetchImagesFromAPI();
  }, [query, page, wasSearch]);

  const changeQuery = newQuery => {
    setQuery(`${Date.now()}/${newQuery}`);
    setImages([]);
    setPage(1);
    setWasSearch(true);
  }

  const loadMore = () => {
    setPage(prevState => prevState + 1);

  }
  return (
    <div className={css.container}>
      <Searchbar onChangeQuery={changeQuery} />
      {loading && (
        <Dna
          visible={loading}
          height="80"
          width="80"
          ariaLabel="dna-loading"
          wrapperStyle={{
          marginRight: "auto",
          marginLeft: "auto"
          }}
          wrapperClass="dna-wrapper"
        />
      )}
      {images.length !== 0 && (
        <ImageGallery imagesGallery={images}/>
      )}
      {loadMoreBtn && (
        <Button onLoadMore={loadMore}/>
      )}
      {(images.length !== 0 && !loadMoreBtn) && (
        <p>We're sorry, but you've reached the end of search results.</p>
      )}
      <NotificationContainer />
    </div>
  )
}
