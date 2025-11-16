const LoadingFallback = () => (
	<div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
		<div className="flex items-center space-x-3">
			{/* Tailwind CSS Spinner Animation */}
			<svg
				className="animate-spin h-8 w-8 text-indigo-400"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
			>
				<circle
					className="opacity-25"
					cx="12"
					cy="12"
					r="10"
					stroke="currentColor"
					strokeWidth="4"
				></circle>
				<path
					className="opacity-75"
					fill="currentColor"
					d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
				></path>
			</svg>

			<h1 className="text-2xl font-semibold tracking-wider">
				Loading Application
			</h1>
		</div>

		<p className="mt-4 text-sm text-gray-400">
			Initializing theme and application state...
		</p>

		{/* Simple Progress Bar */}
		<div className="w-64 mt-6 h-1 bg-gray-700 rounded-full overflow-hidden">
			<div className="h-full bg-indigo-500 w-1/3 animate-pulse"></div>
		</div>
	</div>
);

export default LoadingFallback;
