import React, { useState } from 'react';
import {
  Text,
  Box,
  Flex,
  useColorModeValue,
  Image,
  HStack,
} from '@chakra-ui/react';

const lightSlides = [
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-timeline.png',
  },
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-settings.png',
  },
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-summary-calendar.png',
  },
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-summary-chart.png',
  },
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/light/tockler-search.png',
  },
];

const darkSlides = [
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-timeline.png ',
  },
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-settings.png',
  },
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-summary-calendar.png',
  },
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-summary-chart.png',
  },
  {
    img: 'https://github.com/MayGo/tockler/raw/master/screenshots/dark/tockler-search.png',
  },
];

export const Carousels = () => {
  const arrowStyles = {
    cursor: 'pointer',

    top: '50%',
    w: 'auto',
    mt: '-22px',
    p: '16px',
    color: useColorModeValue('black', 'white'),
    fontWeight: 'bold',
    fontSize: '18px',
    transition: '0.6s ease',
    borderRadius: '0 3px 3px 0',

    _hover: {
      opacity: 0.8,
      bg: useColorModeValue('white', 'black'),
    },
  };

  const slides = useColorModeValue(lightSlides, darkSlides);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slidesCount = slides.length;

  const prevSlide = () => {
    setCurrentSlide(s => (s === 0 ? slidesCount - 1 : s - 1));
  };
  const nextSlide = () => {
    setCurrentSlide(s => (s === slidesCount - 1 ? 0 : s + 1));
  };
  const setSlide = slide => {
    setCurrentSlide(slide);
  };
  const carouselStyle = {
    transition: 'all .5s',
    ml: `-${currentSlide * 100}%`,
  };

  const dotColorMode = useColorModeValue('blackAlpha', 'whiteAlpha');

  return (
    <Flex w="full" alignItems="center" justifyContent="center">
      <Flex w="full" overflow="hidden" pos="relative">
        <Flex w="full" {...carouselStyle}>
          {slides.map((slide, sid) => (
            <Box key={`slide-${sid}`} boxSize="full" shadow="md" flex="none">
              <Image src={slide.img} boxSize="full" backgroundSize="cover" />
            </Box>
          ))}
        </Flex>
        <Text {...arrowStyles} left="0" onClick={prevSlide} position="absolute">
          &#10094;
        </Text>
        <Text
          {...arrowStyles}
          right="0"
          onClick={nextSlide}
          position="absolute"
        >
          &#10095;
        </Text>
        <HStack justify="center" pos="absolute" bottom="8px" w="full">
          {Array.from({ length: slidesCount }).map((_, slide) => (
            <Box
              key={`dots-${slide}`}
              cursor="pointer"
              boxSize={['7px', '15px', '15px']}
              m="0 2px"
              bg={
                currentSlide === slide
                  ? `${dotColorMode}.800`
                  : `${dotColorMode}.500`
              }
              rounded="50%"
              display="inline-block"
              transition="background-color 0.6s ease"
              _hover={{ bg: `${dotColorMode}.800` }}
              onClick={() => setSlide(slide)}
            ></Box>
          ))}
        </HStack>
      </Flex>
    </Flex>
  );
};
