import React from 'react';
import { Tabs, Button } from 'antd';
import { GEO_OPTIONS } from "../constants";


const TabPane = Tabs.TabPane;

export class Home extends React.Component {

    componentDidMount() {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                this.onSuccessLoadGeoLocation,
                this.onFailedLoadGeoLocation,
                GEO_OPTIONS,
            );
        } else {

        }
    }

    onSuccessLoadGeoLocation = (position) => {

    }

    onFailedLoadGeoLocation = (error) => {

    }

    render() {
        const operations = <Button type="primary">Create New Post</Button>;
        return (
            <Tabs className="main-tabs" tabBarExtraContent={operations}>
                <TabPane tab="Image Posts" key="1">Content of tab 1</TabPane>
                <TabPane tab="Video Posts" key="2">Content of tab 2</TabPane>
                <TabPane tab="Map" key="3">Content of tab 3</TabPane>
            </Tabs>
        );
    }
}



