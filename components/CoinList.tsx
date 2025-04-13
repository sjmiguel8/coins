"use client";

import React from 'react';
import Coin from './coin';
import { Canvas } from '@react-three/fiber';

export interface CoinProps {
  id: string;
  name: string;
  image: string;
  symbol: string;
  price: number;
  volume: number;
  priceChange: number;
  marketCap: number;
  position: [number, number, number];
}


interface CoinListProps {
  coins: CoinProps[];
  positions: [number, number, number][];
}

const CoinList: React.FC<CoinListProps> = ({ coins, positions }) => {
  return (
    <Canvas>
      {coins.map((coin, index) => (
        <Coin
          key={coin.id}
          name={coin.name}
          image={coin.image}
          symbol={coin.symbol}
          price={coin.price}
          volume={coin.volume}
          priceChange={coin.priceChange}
          marketCap={coin.marketCap}
          position={positions[index]} // Use positions prop
        />
      ))}
    </Canvas>
  );
};

export default CoinList;
