const App = () => {
    eagle.onItemAdded((item) => {
        console.log('onItemAdded: ', item);
    });

    eagle?.onItemUpdated((item) => {
        console.log('onItemUpdated: ', item);
    });

    eagle.onItemDeleted((item) => {
        console.log('onItemDeleted: ', item);
    });

    return (
        <div>
            <h1>{'Eagle Item Events Plugin'}</h1>
            <div></div>
        </div>
    );
};

export { App };
