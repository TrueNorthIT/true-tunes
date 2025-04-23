const Seperator: React.FC<{ text?: string }> = (props) => {
    return (
        <div className="relative flex items-center">
            {/* Left Line */}
            <div className="ml-4 flex-grow border-t border-gray-400"></div>

            {/* Centered Text */}
            {props.text && (
                <span className="mx-4 text-sm font-medium text-gray-100">
                    {props.text}
                </span>
            )}

            {/* Right Line */}
            <div className="flex-grow border-t border-gray-400 mr-4"></div>
        </div>
    );
};

export default Seperator;
