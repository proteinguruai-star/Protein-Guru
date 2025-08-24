import './globals.css';
import SmoothScroll from './SmoothScroll';

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
