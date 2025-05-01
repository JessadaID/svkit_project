<!-- src/lib/components/Sidebar.svelte -->
<script>
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';
	// import { createEventDispatcher } from 'svelte'; // Keep if you might add events later

	let selectedItemId = ''; // Renamed from menuList for clarity and consistency

	// --- State ---
	let isOpen = true; // Sidebar starts open by default

	// Hardcoded menu items (Consider making this dynamic via props or context if roles are needed)
	export let menuItems = [];
	// const dispatch = createEventDispatcher();

	// --- Functions ---
	function toggleSidebar() {
		isOpen = !isOpen;
	}

	// Select URL and navigate
	function selectMenuItem(item) {
		selectedItemId = item.id; // Update the state IF you want the sidebar to manage it internally
		// If the parent manages selectedItemId via bind:selectedItemId, just navigate
		goto(`/TS_Dashboard/${item.id}`); // Assuming base path is /TS_Dashboard/

	}

</script>

<!-- Sidebar Container -->
<!-- Using a slightly darker gray and ensuring full height -->
<div class={`transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-800 to-gray-900 text-gray-100 relative flex flex-col h-full shadow-lg`}>
	<!-- Toggle Button -->
	<!-- Improved styling: slightly inset, better hover/focus -->
	<button
		class="absolute -right-3 top-9 z-20 p-1.5 rounded-full bg-gray-700 text-white hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 transition-colors duration-200"
		on:click={toggleSidebar}
		aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
	>
		{#if isOpen}
			<!-- Chevron Left -->
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
			</svg>
		{:else}
			<!-- Chevron Right -->
			<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
				<path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
			</svg>
		{/if}
	</button>

	<!-- Sidebar Content -->
	<!-- Increased top padding, added bottom padding -->
	<div class="flex-grow overflow-y-auto overflow-x-hidden pt-16 pb-4 px-4">
		<nav class="space-y-2">
			{#each menuItems as item (item.id)}
				{@const isActive = selectedItemId === item.id}
				<button
					class={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 group font-medium
						${isActive
							? 'bg-indigo-600 text-white shadow-md'
							: 'text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:bg-gray-700 focus:text-white'}
						${!isOpen ? 'justify-center' : ''}`
					}
					on:click={() => selectMenuItem(item)}
					aria-current={isActive ? 'page' : undefined}
				>
					<!-- Icon Styling: Consistent size, slight adjustment on hover -->
					<span class={`flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-200 ease-in-out ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white group-focus:text-white'}`}>
						{@html item.icon}
					</span>

					<!-- Label Styling: Smooth slide transition, nowrap -->
					{#if isOpen}
						<span
							transition:slide={{ duration: 200, axis: 'x' }}
							class="ml-3 whitespace-nowrap flex-grow text-left"
						>
							{item.label}
						</span>
					{/if}
				</button>
			{/each}
		</nav>
	</div>

</div>

<style>
	/* Optional: Add global styles or overrides here if needed */
	/* Ensure icons render correctly if SVGs have fixed sizes */
	.icon {
		display: inline-block;
		vertical-align: middle;
        width: 100%; /* Ensure SVG takes container width */
        height: 100%; /* Ensure SVG takes container height */
	}

    /* Improve scrollbar appearance (optional, browser-specific) */
    ::-webkit-scrollbar {
        width: 6px;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }
    ::-webkit-scrollbar-thumb {
        background-color: rgba(156, 163, 175, 0.4); /* gray-400 with opacity */
        border-radius: 3px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background-color: rgba(107, 114, 128, 0.6); /* gray-500 with opacity */
    }
</style>
