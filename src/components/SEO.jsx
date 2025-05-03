import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, image, pathname }) => {
  // Try to get pathname from router if not provided as prop
  let locationPathname = pathname;
  try {
    const location = useLocation();
    locationPathname = location.pathname;
  } catch (e) {
    console.log('Router context not available, using provided pathname');
  }
  const siteUrl = 'https://rtd-travel-check.vercel.app';
  const canonicalUrl = `${siteUrl}${pathname}`;
  const defaultImage = `${siteUrl}/logo.png`;

  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "RTD Travel Check",
    "url": siteUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <title>{title || 'Visa Requirements for US Refugee Travel Document'}</title>
      <meta name="description" content={description || 'Comprehensive guide to visa requirements for US Refugee Travel Document holders worldwide'} />
      
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title || 'RTD Travel Check - Visa Requirements'} />
      <meta property="og:description" content={description || 'Check visa requirements for US Refugee Travel Document holders'} />
      <meta property="og:image" content={image || defaultImage} />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || 'RTD Travel Check - Visa Requirements'} />
      <meta name="twitter:description" content={description || 'Check visa requirements for US Refugee Travel Document holders'} />
      <meta name="twitter:image" content={image || defaultImage} />
      
      <link rel="canonical" href={canonicalUrl} />
      <script type="application/ld+json">
        {JSON.stringify(schemaOrgJSONLD)}
      </script>
    </Helmet>
  );
};

export default SEO;
