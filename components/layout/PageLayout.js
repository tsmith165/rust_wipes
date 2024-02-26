import Navbar from './Navbar';

const PageLayout = ({ children }) => {
    return (
        <div className="p-0">
            <main className="min-h-full bg-grey">
                <Navbar />
                <div className="relative h-[calc(100vh-150px)] w-full md-nav:h-[calc(100vh-100px)]">{children}</div>
            </main>
        </div>
    );
};

export default PageLayout;
