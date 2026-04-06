// List of allowed bloggers for registration and login
// This list is used to verify blogger identity based on Name and Phone number.

const allowedBloggers = [
    { name: "Nabat Nəsirova", phone: "050-723-73-16" },
    { name: "Aydan", phone: "050-858-95-86" },
    { name: "Aydan Rzayeva", phone: "055-269-85-06" },
    { name: "Sevda Nəcəfova", phone: "051-927-15-66" },
    { name: "Fatimə Aslanova", phone: "051-619-25-07" },
    { name: "Nəzmin Bağızadə", phone: "055-800-14-85" },
    { name: "Agsun Həsənzadə", phone: "050-361-47-86" },
    { name: "Samir Mərdanova", phone: "051-513-26-63" },
    { name: "", phone: "050-778-28-82" }, // (Bu sətirdə ad yazılmayıb, sadecə nömrə və faiz var)
    { name: "Aytaç Məmmədova", phone: "051-559-30-30" },
    { name: "Rüzgar Nəsibova SMM", phone: "055-727-53-74" },
    { name: "Aytən Quliyeva", phone: "055-803-66-62" },
    { name: "Ülkər İbrahimli", phone: "051-874-71-03" },
    { name: "Günel Rzayeva", phone: "050-500-50-61" },
    { name: "Aysel Əzizova", phone: "010-110-31-08" },
    { name: "Sevinc Ağazadə", phone: "050-694-90-48" },
    { name: "Məhicən Qarayeva", phone: "070-430-80-90" },
    { name: "Arzu Əliqızı", phone: "070-340-37-35" },
    { name: "Asya Şahbazlı", phone: "051-964-85-03" },
    { name: "Ayşən Seyidova", phone: "050-827-03-64" },
    { name: "Aynur Ələkbərli", phone: "050-734-32-88" },
    { name: "Aydan Xəlilzadə", phone: "" }, // (Bu addan sonra nömrə yazılmayıb)
    { name: "Əliyeva Səidə", phone: "050-835-01-25" },
    { name: "Həsənova Hüsnüyyə", phone: "055-747-78-30" },
    { name: "Məmmədli Fatimə", phone: "077-616-08-28" },
    { name: "Fidan İlyaszadə", phone: "050-808-50-55" },
    { name: "Xəyalə Rzayeva", phone: "055-825-80-27" },
    { name: "Könül Raufqızı", phone: "055-701-68-88" },
    { name: "Ləman Məmmədova", phone: "077-315-90-25" },
    { name: "Məryəm Məmmədova", phone: "077-377-49-96" },
    { name: "Müjgan Hüseynova", phone: "055-727-01-15" },
    { name: "Simə Xəlilova", phone: "050-585-67-14" },
    { name: "Mətanət Abdullayeva", phone: "055-545-60-35" }
];

/**
 * Validates if the given name and phone match any entry in the allowed list.
 * Normalizes input by removing extra spaces and special characters from phone numbers.
 */
export const isBloggerAllowed = (inputName, inputPhone) => {
    const normalize = (str) => str?.toLowerCase().trim().replace(/\s+/g, " ") || "";
    const normalizePhone = (ph) => ph?.replace(/[^0-9]/g, "") || "";

    const name = normalize(inputName);
    const phone = normalizePhone(inputPhone);

    return allowedBloggers.some(entry => {
        const entryName = normalize(entry.name);
        const entryPhone = normalizePhone(entry.phone);

        // If name matches perfectly or if name is empty in list, we fall back to phone
        // Or if phone is empty in list, we fall back to name
        const nameMatches = entryName === "" || name === entryName;
        const phoneMatches = entryPhone === "" || phone === entryPhone;

        // Both must match if both are present in the entry
        if (entryName !== "" && entryPhone !== "") {
            return nameMatches && phoneMatches;
        }
        
        // Otherwise, match what is available
        return nameMatches && phoneMatches;
    });
};

export default allowedBloggers;
