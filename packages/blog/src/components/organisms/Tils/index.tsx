import { TilWithRawHtml } from "@blog/types/entry";
import { styled } from "@linaria/react";
import React from "react";
import { TilItem } from "./TilItem";


const TilsUl = styled.ul`
width: 100%;
position: relative;
justify-content: space-between;
margin-bottom: 64px;

& > * {
  margin-top: 64px;
}
`;


interface TilsProps {
  tils: TilWithRawHtml[];
}

export const Tils: React.FC<TilsProps> = ({tils}) => {
  return <TilsUl>
    {tils.map((til) => (
      <TilItem til={til} key={til.slug} />
    ))} 
  </TilsUl>;
}
