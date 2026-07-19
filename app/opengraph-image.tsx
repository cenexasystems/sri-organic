import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Dasarathi Krubha Traders - Sri Organic';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#FAF9F5',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <img 
          src="https://sriorganic.com/logo.svg" 
          alt="Sri Organic Logo" 
          style={{ width: '400px', height: 'auto', marginBottom: '40px' }} 
        />
        <h1
          style={{
            fontSize: '60px',
            color: '#111111',
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          Clinical Botanical Solutions
        </h1>
        <p
          style={{
            fontSize: '30px',
            color: '#D4AF37',
            textAlign: 'center',
          }}
        >
          Authentic Organic Heirloom Rice & Wood-Pressed Oils
        </p>
      </div>
    ),
    {
      ...size,
    }
  );
}
