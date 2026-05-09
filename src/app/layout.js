import "./globals.css";

export const metadata = {
  title: "Le Quy Phat (Titus Le) | Data Analyst Portfolio",
  description: "Data Analyst with nearly 2 years of experience, fueled by a passion for Data & AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="https://res.cloudinary.com/dd7gti2kn/image/upload/v1761701714/samples/LeQuyPhat_DA_rd9ufj.png" type="image/x-icon" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Be+Vietnam+Pro:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
