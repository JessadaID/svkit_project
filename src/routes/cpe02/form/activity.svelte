<!-- ActivityCalendar.svelte -->
<script lang="ts">
  export let tableTitle: string;
  export let monthLabels: string[];
  export let activities: Activity[];

  interface Activity {
    id: number;
    name: string;
    months: { [key: string]: boolean };
    color: string;
  }

  // ข้อมูลส่วนหัวที่แก้ไขได้

  function addActivity() {
    const newId = activities.length + 1;
    activities = [
      ...activities,
      {
        id: newId,
        name: "",
        months: Object.fromEntries(monthLabels.map((month) => [month, false])),
        color: "#11235A",
      },
    ];
  }

  function removeActivity(id: number) {
    activities = activities.filter((activity) => activity.id !== id);
  }
  /*
  function handleSubmit() {
    console.log("Submitted data:", {
      tableTitle,
      monthLabels,
      activities,
    });
  }*/

  // เพิ่มคอลัมน์เดือนใหม่
  function addMonth() {
    const newMonth = `เดือน${monthLabels.length + 1}`;
    monthLabels = [...monthLabels, newMonth];

    // อัพเดทข้อมูลกิจกรรมเพื่อรองรับเดือนใหม่
    activities = activities.map((activity) => ({
      ...activity,
      months: {
        ...activity.months,
        [newMonth]: false,
      },
    }));
  }

  function removeMonth(index: number) {
    const monthToRemove = monthLabels[index];
    monthLabels = monthLabels.filter((_, i) => i !== index);

    // อัปเดตกิจกรรมเพื่อเอาเดือนที่ลบออก
    activities = activities.map((activity) => {
      const updatedMonths = { ...activity.months };
      delete updatedMonths[monthToRemove];
      return { ...activity, months: updatedMonths };
    });
  }

  // อัพเดทข้อมูลกิจกรรมเมื่อมีการเปลี่ยนแปลงชื่อเดือน
  $: {
    activities = activities.map((activity) => ({
      ...activity,
      months: Object.fromEntries(
        monthLabels.map((month) => [month, activity.months[month] || false])
      ),
    }));
  }

</script>

<div class="max-w-5xl mx-auto py-4">
  <div class="overflow-x-auto">
    <table class="w-full border-collapse border border-gray-300">
      <thead>
        <tr class="bg-gray-100">
          <th class="border border-gray-300 p-2 w-1/4">กิจกรรม</th>
          <th
            class="border border-gray-300 p-2"
            colspan={monthLabels.length + 1}
          >
            <div class="flex items-center justify-between px-2">
              <input
                type="text"
                bind:value={tableTitle}
                class="flex-1 p-1 text-center bg-transparent"
              />
              <button
                type="button"
                on:click={addMonth}
                class="ml-2 px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
              >
                + เพิ่มเดือน
              </button>
            </div>
          </th>
        </tr>
        <tr class="bg-gray-50">
          <th class="border border-gray-300 p-2"></th>
          {#each monthLabels as month, i}
            <th class="border border-gray-300">
              <div class="flex items-center justify-between relative">
                <input
                  type="text"
                  bind:value={monthLabels[i]}
                  class="w-full py-2 text-center bg-transparent"
                />

                <svg
                  class="transition-all duration-300 ease-in-out p-1 text-white absolute top-0 right-0 bg-red-500 cursor-pointer hover:p-0"
                  on:click={() => removeMonth(i)}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18 17.94 6M18 18 6.06 6"
                  />
                </svg>
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each activities as activity (activity.id)}
          <tr>
            <td class="border border-gray-300 p-2 relative">
              <div class="flex items-center space-x-2 ">
                <input
                  type="text"
                  bind:value={activity.name}
                  class="w-full p-1 border border-gray-300 rounded"
                  placeholder="ชื่อกิจกรรม"
                />

                <svg
                  class="transition-all duration-300 ease-in-out p-1 text-white absolute top-0 right-0 bg-red-500 cursor-pointer hover:p-0"
                  on:click={() => removeActivity(activity.id)}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18 17.94 6M18 18 6.06 6"
                  />
                </svg>
              </div>
            </td>
            {#each monthLabels as month}
              <td class="border border-gray-300 p-2 text-center">
                <input
                  type="checkbox"
                  bind:checked={activity.months[month]}
                  class="w-4 h-4"
                />
              </td>
            {/each}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="flex space-x-4 pt-2">
    <button
      type="button"
      on:click={addActivity}
      class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
    >
      เพิ่มกิจกรรม
    </button>
  </div>
</div>
