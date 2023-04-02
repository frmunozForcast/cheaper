import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter, BrowserRouter } from 'react-router-dom'
import { CheaperApp } from './CheaperApp'
import './index.css'
import { Marketplace, Seller, Login, Item} from './pages/';

const router = createBrowserRouter([
  {
    path: '/marketplace',
    element: <Marketplace/>
  },
  {
    path: '/seller',
    element: <Seller/>
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: '/',
    children: [
      {
        path: '/item/:id',
        element: <Item/>
      }
    ]
  }

]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
    <CheaperApp/>
    <RouterProvider router={router}/>

    </React.StrictMode>,
)
