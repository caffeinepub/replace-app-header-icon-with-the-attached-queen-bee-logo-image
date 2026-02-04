export default function BrandHeader() {
  return (
    <header className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 flex items-center justify-center">
            <img
              src="/assets/generated/queen-bee-app-icon.dim_180x180.png"
              alt="Queen Bee Guitar Repair logo"
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100">
              Queen Bee Guitar Repair
            </h1>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Professional Luthier Services & Invoicing
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
