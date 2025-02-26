import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import fs from 'fs/promises';
import path from 'path';

export const load: PageServerLoad = async ({ params }) => {
  
  const { id } = params;

  try {
    const filepath = path.join(process.cwd(), 'static', 'problems', `${id}.json`);
    const fileContents = await fs.readFile(filepath, 'utf-8');
    const problem = JSON.parse(fileContents);

    return {
      problem
    };
  } catch (err) {
    console.error(err);
    return error(404, 'Problem not found');
  }
};