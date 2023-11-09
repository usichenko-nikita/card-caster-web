import React, { useState } from 'react';
import { useSprings, animated } from 'react-spring';
import { useGesture } from 'react-use-gesture';
import './index.css';

// Constants for card animation and transformation
const CARD_ROTATION_DEGREES = 20;
const ANIMATION_CONFIG = { friction: 50, tension: 500 };
const FLY_OUT_WIDTH = 200;
const VELOCITY_THRESHOLD = 0.2;
const SCALE_DOWN = 1;
const SCALE_UP = 1.1;

// Card data
const cardImages = [
  require('./assets/cards/ace.png'),
  require('./assets/cards/card3.png'),
  require('./assets/cards/queen.png'),
  require('./assets/cards/card2.png'),
  require('./assets/cards/jack.png'),
  require('./assets/cards/card4.png'),
  require('./assets/cards/king.png'),
];

// Card animation presets
const toSpringProps = i => ({
  x: 0,
  y: i * -4,
  scale: SCALE_DOWN,
  rot: -10 + Math.random() * CARD_ROTATION_DEGREES,
  delay: i * 100,
});
const fromSpringProps = () => ({ x: 0, rot: 0, scale: SCALE_UP, y: -1000 });

// Transform function for the card
const transformCard = (r, s) =>
    `perspective(1500px) rotateX(30deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const Deck = () => {
  const [discardedCards, setDiscardedCards] = useState(new Set());
  const [springs, api] = useSprings(cardImages.length, i => ({
    ...toSpringProps(i),
    from: fromSpringProps(),
  }));

  // Handling card gesture
  const bindCardGesture = useGesture({
    onDrag: ({ args: [index], down, movement: [xDelta], velocity, direction: [xDir], memo = toSpringProps(index) }) => {
      const isFlickedOut = velocity > VELOCITY_THRESHOLD;
      const direction = xDir < 0 ? -1 : 1;

      if (!down && isFlickedOut) discardedCards.add(index);

      api.start(i => {
        if (index !== i) return;
        const isDiscarded = discardedCards.has(index);
        const x = isDiscarded ? (FLY_OUT_WIDTH + window.innerWidth) * direction : down ? xDelta : 0;
        const rot = xDelta / 100 + (isDiscarded ? direction * 10 * velocity : 0);
        const scale = down ? SCALE_UP : SCALE_DOWN;

        return {
          x,
          rot,
          scale,
          immediate: down,
          config: { ...ANIMATION_CONFIG, tension: down ? 800 : isDiscarded ? 200 : ANIMATION_CONFIG.tension },
        };
      });

      if (!down && discardedCards.size === cardImages.length) {
        setTimeout(() => {
          setDiscardedCards(new Set());
          api.start(i => toSpringProps(i));
        }, 600);
      }

      return memo;
    },
  });

  return springs.map((styles, i) => (
      <animated.div key={i} style={{ x: styles.x, y: styles.y }}>
        <animated.div
            {...bindCardGesture(i)}
            style={{
              transform: styles.rot.to(transformCard),
              backgroundImage: `url(${cardImages[i]})`,
            }}
        />
      </animated.div>
  ));
};

export default Deck;
