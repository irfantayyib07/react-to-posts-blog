import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';
import { extendedUsersApiSlice } from "./features/users/usersSlice";
import { extendedPostsApiSlice } from './features/posts/postsSlice';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

store.dispatch(extendedPostsApiSlice.endpoints.getPosts.initiate()); // initiate thunk
store.dispatch(extendedUsersApiSlice.endpoints.getUsers.initiate());

const root = ReactDOM.createRoot(document.getElementById('site-wrapper'));
root.render(
 <React.StrictMode>
  <Provider store={store}>
   <Router>
    <Routes>
     <Route element={<App />} path='/*' />
    </Routes>
   </Router>
  </Provider>
 </React.StrictMode>
);
