import { HomeHero } from '../components/home/HomeHero';
import {
  BlogPreview, Credentials, EstimateBand, Process, Projects, Services, Stakes, Story, Testimonials, Why,
} from '../components/home/HomeSections';

// Rhythm: no two neighbouring bands share a ground, and the full-bleed red
// field arrives once, at the point of the page (the estimate form).
export function HomePage() {
  return (
    <>
      <HomeHero />
      <Credentials />
      <Stakes />
      <Services />
      <Projects />
      <Story />
      <Why />
      <Process />
      <Testimonials />
      <BlogPreview />
      <EstimateBand />
    </>
  );
}
