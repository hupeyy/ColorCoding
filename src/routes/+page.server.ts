import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import fs from 'fs/promises';
import path from 'path';

export const load: PageServerLoad = async () => {
  try {
    const problemsDir = path.join(process.cwd(), 'static', 'problems');
    const files = await fs.readdir(problemsDir);
    
    const problems = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(problemsDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
      })
    );

    const sortedProblems = problems.sort((a, b) => {
        const difficultyOrder = { 'easy': 0, 'medium': 1, 'hard': 2 };
        return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });

    return { problems: sortedProblems };
  } catch (err) {
    console.error(err);
    error(500, 'Error loading problems');
  }
};