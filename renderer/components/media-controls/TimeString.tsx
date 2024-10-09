import { useEffect, useState } from "react";


export const TimeString: React.FC<{ date: string }> = ({ date }) => {
    const [formattedString, setFormattedString] = useState<string>(date);

    useEffect(() => {

        if (!date) {
            setFormattedString(" ")
        }
        
        // date is in form H:MM:SS
        // Chop off the hours if it's 0: 

        let formatted = date;
        if (date?.startsWith("0:")) {
            formatted = date.slice(2);
        }
        setFormattedString(formatted);
        
        
    }, [date]);

    return (
        <p className="text-gray-600 font-semibold" >{formattedString}</p>
    );

};