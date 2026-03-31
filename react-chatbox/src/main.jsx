import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Head from './body';

const root = createRoot(document.querySelector("#root"));

root.render(
	<>
		<Head />
		
	</>
)