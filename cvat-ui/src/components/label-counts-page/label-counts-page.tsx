// Copyright (C) CVAT.ai Corporation
//
// SPDX-License-Identifier: MIT

import React, { useCallback, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router';
import { Row, Col } from 'antd/lib/grid';
import Button from 'antd/lib/button';
import Empty from 'antd/lib/empty';
import Result from 'antd/lib/result';
import Spin from 'antd/lib/spin';
import Text from 'antd/lib/typography/Text';
import Title from 'antd/lib/typography/Title';
import { LeftOutlined } from '@ant-design/icons';

import { getCore } from 'cvat-core-wrapper';

const core = getCore();

export interface LabelCount {
    label_id: number;
    name: string;
    count: number;
}

type PageState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'loaded'; counts: LabelCount[] };

export default function LabelCountsPage(): JSX.Element {
    const { id } = useParams<{ id: string }>();
    const history = useHistory();
    const [state, setState] = useState<PageState>({ status: 'loading' });

    const load = useCallback(async (): Promise<void> => {
        setState({ status: 'loading' });
        try {
            const response = await core.server.request(
                `${core.config.backendAPI}/test/tasks/${id}/label-counts`,
                { method: 'GET' },
            );
            setState({ status: 'loaded', counts: response.data });
        } catch (error: unknown) {
            setState({ status: 'error', message: error instanceof Error ? error.message : String(error) });
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    let content: JSX.Element;
    if (state.status === 'loading') {
        content = <Spin size='large' />;
    } else if (state.status === 'error') {
        content = (
            <Result
                status='error'
                title='Could not load label counts'
                subTitle={state.message}
                extra={<Button onClick={load}>Retry</Button>}
            />
        );
    } else if (state.counts.every((row) => row.count === 0)) {
        content = <Empty description='This task has no annotations yet.' />;
    } else {
        const total = state.counts.reduce((sum, row) => sum + row.count, 0);
        content = (
            <>
                <Text>{`${total} shapes in ${state.counts.length} labels`}</Text>
                <ol>
                    {state.counts.map((row) => <li key={row.label_id}>{`${row.name}: ${row.count}`}</li>)}
                </ol>
            </>
        );
    }

    return (
        <Row justify='center' className='cvat-label-counts-page'>
            <Col span={20}>
                <Button type='link' size='large' onClick={() => history.push(`/tasks/${id}`)}>
                    <LeftOutlined />
                    Back to task
                </Button>
                <Title level={4}>{`Label counts — task #${id}`}</Title>
                {content}
            </Col>
        </Row>
    );
}
