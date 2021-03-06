import { NowRequest, NowResponse } from '@vercel/node';
import x from '../../assets/x';
import o from '../../assets/o';
import blank from '../../assets/blank';
import {
  currentTurn,
  hasWinner,
  isDraw,
  tictactoeData,
  updateTictactoeData,
} from '../../util/tictactoe';

export default async (req: NowRequest, res: NowResponse) => {
  const {
    query: { code },
    headers,
  } = req;
  const dest = headers['sec-fetch-dest'] || headers['Sec-Fetch-Dest'];
  const accept = headers['accept'];
  const isImage = dest ? dest === 'image' : !/text\/html/.test(accept);

  const data = await tictactoeData();
  const winner = await hasWinner(data);
  const isDrawLocal = await isDraw(data);

  const found = data.find((el) => el.code === code);

  res.setHeader('Cache-Control', 'no-cache, max-age=0');
  if (isImage) {
    const image =
      found.value === 'X'
        ? x(winner === 'X' || isDrawLocal, isDrawLocal ? 'DRAW!' : 'WINNER!')
        : found.value === 'O'
        ? o(winner === 'O' || isDrawLocal, isDrawLocal ? 'DRAW!' : 'WINNER!')
        : blank;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.send(image);
  }

  if (winner || isDrawLocal) {
    data.forEach((el) => {
      el.value = '';
    });
  }

  if (found && !found.value) {
    found.value = await currentTurn(data);
    await updateTictactoeData(data);
  }

  res.writeHead(301, {
    Location: 'https://github.com/alfari16',
  });
  res.end();
};
