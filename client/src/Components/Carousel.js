import { Virtual, Navigation } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import Paper from "@mui/material/Paper";

// Import Swiper styles
import "swiper/css";
import "swiper/css/virtual";
import "swiper/css/navigation";

export default function Carousel(props) {
  const slides = Array.from({ length: 1000 }).map(
    (el, index) => `Sheet ${index + 1}`
  );

  return (
    <Swiper
      modules={[Virtual, Navigation]}
      navigation={true}
      spaceBetween={50}
      centeredSlides={true}
      grabCursor={true}
      slidesPerView={5}
      virtual
    >
      {slides.map((slideContent, index) => (
        <SwiperSlide key={slideContent} virtualIndex={index}>
          <Paper sx={{ m: 1, width: 128, height: 128, textAlign: "center" }}>
            {slideContent}
          </Paper>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
