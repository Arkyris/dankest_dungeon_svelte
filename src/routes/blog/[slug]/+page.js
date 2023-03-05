import { error } from '@sveltejs/kit';
 
/** @type {import('./$types').PageLoad} */
export function load({route, params }) {
  if (params.slug === 'hello-world') {
    console.log(route)
    return {
      title: 'Hello world!',
      content: 'Welcome to our blog. Lorem ipsum dolor sit amet...'
    };
  }
 
  throw error(404, 'Not found hi');
}