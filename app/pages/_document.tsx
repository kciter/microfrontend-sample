import Document, { Html, Head, Main, NextScript, DocumentContext } from 'next/document';
const sharePatch = require('@module-federation/nextjs-mf/patchSharing');

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        {sharePatch()}
        <script src="http://localhost:3001/_next/static/remoteEntryMerged.js" />
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
